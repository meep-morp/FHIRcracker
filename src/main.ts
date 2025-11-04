import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
	const logger = new Logger("Bootstrap");

	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	// Get configuration
	const port = configService.get<number>("app.port", 3000);
	const corsOrigin = configService.get<string>("app.corsOrigin", "*");
	const apiPrefix = configService.get<string>("app.apiPrefix", "api");

	// Enable CORS
	app.enableCors({
		origin: corsOrigin === "*" ? true : corsOrigin.split(","),
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	});

	// Global prefix for all routes
	app.setGlobalPrefix(apiPrefix);

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			disableErrorMessages: false,
			validationError: {
				target: false,
				value: false,
			},
		})
	);

	// Swagger API documentation
	const config = new DocumentBuilder()
		.setTitle("FHIRcracker API")
		.setDescription(
			"Summarizes large swaths of FHIR Resources via a fhir batch request using NVIDIA NeMo Retriever OCR"
		)
		.setVersion("1.0.0")
		.addTag("FHIR Summarization", "Endpoints for FHIR data summarization")
		.addServer(`http://localhost:${port}`, "Development server")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				name: "JWT",
				description: "Enter JWT token",
				in: "header",
			},
			"JWT-auth"
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
		swaggerOptions: {
			persistAuthorization: true,
			tagsSorter: "alpha",
			operationsSorter: "alpha",
		},
		customSiteTitle: "FHIRcracker API Documentation",
	});

	// Start the server
	await app.listen(port);

	logger.log(`🚀 FHIRcracker server is running on: http://localhost:${port}`);
	logger.log(`📚 API documentation is available at: http://localhost:${port}/${apiPrefix}/docs`);
	logger.log(
		`🏥 FHIR summarization endpoint: http://localhost:${port}/${apiPrefix}/fhir/summarize`
	);
	logger.log(`❤️  Health check endpoint: http://localhost:${port}/${apiPrefix}/fhir/health`);

	// Log environment info
	const nodeEnv = configService.get<string>("app.nodeEnv", "development");
	const nvidiaApiConfigured = !!configService.get<string>("nvidia.apiKey");

	logger.log(`Environment: ${nodeEnv}`);
	logger.log(`NVIDIA API configured: ${nvidiaApiConfigured ? "✅" : "❌"}`);

	if (!nvidiaApiConfigured) {
		logger.warn(
			"⚠️  NVIDIA API key not configured. Please set NVIDIA_API_KEY environment variable."
		);
	}
}

bootstrap().catch(error => {
	const logger = new Logger("Bootstrap");
	logger.error("❌ Failed to start server:", error);
	process.exit(1);
});
