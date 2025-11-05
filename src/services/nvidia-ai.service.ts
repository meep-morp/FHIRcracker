import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NvidiaAiRequest, NvidiaAiResponse } from "../interfaces/fhir.interface";
import OpenAI from "openai";

@Injectable()
export class NvidiaAiService {
	private readonly logger = new Logger(NvidiaAiService.name);
	private readonly baseUrl = "https://integrate.api.nvidia.com/v1";
	private readonly model = "meta/llama-3.1-405b-instruct";

	constructor(private configService: ConfigService) {}

	/**
	 * Summarizes FHIR data using NVIDIA's Llama AI model
	 * @param fhirText - Human-readable FHIR data text
	 * @param context - Optional context for summarization
	 * @param resourceCount - Number of resources being summarized
	 * @returns AI-generated summary
	 */
	async summarizeFhirData(
		fhirText: string,
		context?: string,
		resourceCount?: number
	): Promise<string> {
		try {
			const systemPrompt = this.buildSystemPrompt();
			const userPrompt = this.buildUserPrompt(fhirText, context, resourceCount);

			const request: NvidiaAiRequest = {
				model: this.model,
				messages: [
					{
						role: "system",
						content: systemPrompt,
					},
					{
						role: "user",
						content: userPrompt,
					},
				],
				max_tokens: this.calculateMaxTokens(resourceCount),
				temperature: 0.1,
				top_p: 0.9,
			};

			this.logger.log(`Sending request to NVIDIA Llama AI API for ${resourceCount || 0} resources`);

			const response = await this.callNvidiaApi(request);

			this.logger.debug(`API Response: ${JSON.stringify(response, null, 2)}`);

			if (!response.choices || response.choices.length === 0) {
				throw new HttpException("No response from NVIDIA API", HttpStatus.INTERNAL_SERVER_ERROR);
			}

			const summary = response.choices[0].message?.content || "";

			this.logger.log(
				`Generated summary of ${summary.length} characters: "${summary.substring(0, 100)}..."`
			);

			return summary;
		} catch (error) {
			this.logger.error("Error calling NVIDIA Llama AI API:", error.message);

			if (error instanceof HttpException) {
				throw error;
			}

			throw new HttpException(
				"Failed to generate summary using NVIDIA Llama AI",
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	private buildSystemPrompt(): string {
		return `You are an advanced AI assistant specialized in medical data analysis and summarization. 
Your task is to analyze FHIR (Fast Healthcare Interoperability Resources) data and provide clear, concise, and clinically relevant summaries.

Guidelines for summarization:
1. Focus on clinically significant information, leave out FHIR ids, pretend you are the attending physician summarizing for a colleague. Leave out any intro and only summarize.
2. Use clear, professional medical language
3. Organize information logically (patient demographics, conditions, medications, observations)
4. Highlight important relationships between data elements
5. Maintain patient privacy by referring to patients by their ID or generic terms when appropriate
6. Provide context for medical terms when helpful
7. Keep summaries concise but comprehensive
8. If multiple patients are present, organize by patient or provide an overview
9. Note any concerning findings or patterns
10. Adapt summary length based on data complexity - use 1-2 paragraphs for simple cases, more for complex cases
11. DO NOT use special characters or markdown formatting in the summary. It must be plaintext without newlines such as \n or trailing spaces.

Always maintain clinical accuracy and professionalism in your summaries.`;
	}

	private buildUserPrompt(fhirText: string, context?: string, resourceCount?: number): string {
		let prompt = `Please analyze and summarize the following FHIR healthcare data:\n\n${fhirText}`;

		if (context) {
			prompt += `\n\nAdditional context or focus areas: ${context}`;
		}

		if (resourceCount) {
			if (resourceCount <= 5) {
				prompt += `\n\nThis is a simple case with ${resourceCount} resources. Please provide a concise 1-2 paragraph summary.`;
			} else if (resourceCount <= 20) {
				prompt += `\n\nThis is a moderate case with ${resourceCount} resources. Please provide a comprehensive 2-3 paragraph summary.`;
			} else {
				prompt += `\n\nThis is a complex case with ${resourceCount} resources. Please provide a detailed summary organized by key clinical areas.`;
			}
		}

		prompt += `\n\nPlease provide your summary now:`;

		return prompt;
	}

	private calculateMaxTokens(resourceCount?: number): number {
		if (!resourceCount) return 1000;

		if (resourceCount <= 5) return 800;
		if (resourceCount <= 20) return 1500;
		return 2500;
	}

	private async callNvidiaApi(request: NvidiaAiRequest): Promise<NvidiaAiResponse> {
		const apiKey = this.configService.get<string>("NVIDIA_API_KEY");

		if (!apiKey) {
			throw new HttpException(
				"NVIDIA API key not configured. Please set NVIDIA_API_KEY environment variable.",
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}

		try {
			const openai = new OpenAI({
				apiKey: apiKey,
				baseURL: this.baseUrl,
			});

			this.logger.log(`Calling NVIDIA API with model: ${request.model}`);
			this.logger.debug(`Request payload: ${JSON.stringify(request, null, 2)}`);

			const response = await openai.chat.completions.create({
				model: request.model,
				messages: request.messages,
				max_tokens: request.max_tokens,
				temperature: request.temperature,
				top_p: request.top_p,
				stream: false, // Disable streaming for complete response
			});

			this.logger.debug(`Raw API response: ${JSON.stringify(response, null, 2)}`);

			if (!response) {
				throw new HttpException("Empty response from NVIDIA API", HttpStatus.INTERNAL_SERVER_ERROR);
			}

			return {
				id: response.id,
				object: response.object,
				created: response.created,
				model: response.model,
				choices: response.choices.map(choice => ({
					index: choice.index,
					message: {
						role: choice.message.role,
						content: choice.message.content,
					},
					finish_reason: choice.finish_reason,
				})),
				usage: response.usage,
			};
		} catch (error) {
			if (error.status) {
				const status = error.status;
				const message = error.message;

				this.logger.error(`NVIDIA API error (${status}): ${message}`);

				if (status === 401) {
					throw new HttpException("Invalid NVIDIA API key", HttpStatus.UNAUTHORIZED);
				} else if (status === 429) {
					throw new HttpException("NVIDIA API rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
				} else if (status >= 500) {
					throw new HttpException("NVIDIA API service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
				} else {
					throw new HttpException(`NVIDIA API error: ${message}`, HttpStatus.BAD_REQUEST);
				}
			} else if (error.code === "ECONNABORTED") {
				throw new HttpException("Request timeout to NVIDIA API", HttpStatus.REQUEST_TIMEOUT);
			} else {
				throw new HttpException(
					"Network error calling NVIDIA API",
					HttpStatus.INTERNAL_SERVER_ERROR
				);
			}
		}
	}

	/**
	 * Health check for NVIDIA API availability
	 * @returns Promise<boolean> indicating if the API is accessible
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const testRequest: NvidiaAiRequest = {
				model: this.model,
				messages: [
					{
						role: "user",
						content: "Hello, can you confirm you are working?",
					},
				],
				max_tokens: 50,
				temperature: 0.1,
			};

			await this.callNvidiaApi(testRequest);
			return true;
		} catch (error) {
			this.logger.warn("NVIDIA API health check failed:", error.message);
			return false;
		}
	}
}
