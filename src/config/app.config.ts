import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	nodeEnv: process.env.NODE_ENV || "development",
	corsOrigin: process.env.CORS_ORIGIN || "*",
	apiPrefix: process.env.API_PREFIX || "api",
	apiVersion: process.env.API_VERSION || "v1",
	logLevel: process.env.LOG_LEVEL || "info",
	rateLimit: parseInt(process.env.RATE_LIMIT, 10) || 100,
}));

export const nvidiaConfig = registerAs("nvidia", () => ({
	apiKey: process.env.NVIDIA_API_KEY,
	baseUrl: "https://integrate.api.nvidia.com/v1",
	model: "nvidia/nemoretriever-ocr-v1",
	timeout: 60000,
	maxRetries: 3,
}));

export const fhirConfig = registerAs("fhir", () => ({
	maxBundleSize: parseInt(process.env.MAX_BUNDLE_SIZE, 10) || 1000,
	supportedResourceTypes: [
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
}));
