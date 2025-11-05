import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FhirController } from "./controllers/fhir.controller";
import { FhirService } from "./services/fhir.service";
import { NvidiaAiService } from "./services/nvidia-ai.service";
import appConfig, { nvidiaConfig, fhirConfig } from "./config/app.config";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [appConfig, nvidiaConfig, fhirConfig],
			envFilePath: [".env.local", ".env"],
			validationOptions: {
				allowUnknown: true,
				abortEarly: false,
			},
		}),
	],
	controllers: [FhirController],
	providers: [FhirService, NvidiaAiService],
})
export class AppModule {}
