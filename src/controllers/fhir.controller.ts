import {
	Controller,
	Post,
	Body,
	Get,
	HttpStatus,
	Logger,
	UseInterceptors,
	ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from "@nestjs/swagger";
import { FhirService } from "../services/fhir.service";
import { NvidiaAiService } from "../services/nvidia-ai.service";
import { FhirBatchRequestDto, SummaryResponseDto } from "../dto/fhir.dto";

@ApiTags("FHIR Summarization")
@Controller("fhir")
@UseInterceptors(ClassSerializerInterceptor)
export class FhirController {
	private readonly logger = new Logger(FhirController.name);

	constructor(
		private readonly fhirService: FhirService,
		private readonly nvidiaAiService: NvidiaAiService
	) {}

	@Post("summarize")
	@ApiOperation({
		summary: "Summarize FHIR batch data",
		description:
			"Processes a FHIR Bundle and generates an AI-powered summary using NVIDIA Llama AI",
	})
	@ApiBody({
		type: FhirBatchRequestDto,
		description: "FHIR Bundle data to be summarized",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Successfully generated summary",
		type: SummaryResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid FHIR bundle data",
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: "Error processing request or calling NVIDIA API",
	})
	@ApiHeader({
		name: "Content-Type",
		description: "Must be application/json",
	})
	async summarizeFhirBatch(@Body() request: FhirBatchRequestDto): Promise<SummaryResponseDto> {
		this.logger.log("Received FHIR batch summarization request");

		try {
			// Validate and process the FHIR bundle
			const validatedBundle = this.fhirService.validateAndProcessBundle(request.bundle);

			// Extract and categorize resources
			const resources = this.fhirService.extractResources(validatedBundle);

			// Convert to human-readable format
			const humanReadableText = this.fhirService.convertToHumanReadable(resources);

			// Count total resources
			const resourceCount = this.fhirService.countResources(validatedBundle);

			this.logger.log(`Processing ${resourceCount} resources for summarization`);

			// Generate AI summary using NVIDIA Llama AI
			const summary = await this.nvidiaAiService.summarizeFhirData(
				humanReadableText,
				request.context,
				resourceCount
			);

			const response: SummaryResponseDto = {
				summary,
				resourceCount,
				timestamp: new Date().toISOString(),
			};

			this.logger.log("Successfully generated FHIR summary");

			return response;
		} catch (error) {
			this.logger.error("Error processing FHIR batch summarization:", error.message);
			throw error;
		}
	}

	@Get("health")
	@ApiOperation({
		summary: "Health check",
		description: "Checks the health of the FHIR service and NVIDIA Llama AI API",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Service is healthy",
		schema: {
			type: "object",
			properties: {
				status: { type: "string", example: "healthy" },
				timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
				services: {
					type: "object",
					properties: {
						fhir: { type: "string", example: "operational" },
						nvidia_ai: { type: "string", example: "operational" },
					},
				},
			},
		},
	})
	async healthCheck() {
		this.logger.log("Health check requested");

		try {
			// Check NVIDIA Llama AI API
			const nvidiaHealthy = await this.nvidiaAiService.healthCheck();

			return {
				status: "healthy",
				timestamp: new Date().toISOString(),
				services: {
					fhir: "operational",
					nvidia_ai: nvidiaHealthy ? "operational" : "degraded",
				},
			};
		} catch (error) {
			this.logger.error("Health check failed:", error.message);

			return {
				status: "degraded",
				timestamp: new Date().toISOString(),
				services: {
					fhir: "operational",
					nvidia_ai: "unavailable",
				},
				error: error.message,
			};
		}
	}

	@Get("info")
	@ApiOperation({
		summary: "Service information",
		description: "Returns information about the FHIR summarization service",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Service information",
		schema: {
			type: "object",
			properties: {
				name: { type: "string", example: "FHIRcracker" },
				version: { type: "string", example: "1.0.0" },
				description: { type: "string" },
				ai_model: { type: "string", example: "meta/llama-3.1-405b-instruct" },
				supported_resources: {
					type: "array",
					items: { type: "string" },
					example: ["Patient", "Condition", "Medication", "Observation"],
				},
			},
		},
	})
	getServiceInfo() {
		return {
			name: "FHIRcracker",
			version: "1.0.0",
			description:
				"Summarizes large swaths of FHIR Resources via a fhir batch request using NVIDIA Llama AI",
			ai_model: "meta/llama-3.1-405b-instruct",
			supported_resources: [
				"Patient",
				"Condition",
				"Medication",
				"MedicationRequest",
				"Observation",
				"Procedure",
				"DiagnosticReport",
				"Encounter",
				"AllergyIntolerance",
				"Immunization",
			],
			endpoints: {
				summarize: "POST /api/fhir/summarize",
				health: "GET /api/fhir/health",
				info: "GET /api/fhir/info",
			},
		};
	}
}
