import { IsNotEmpty, IsOptional, IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FhirBatchRequestDto {
	@ApiProperty({
		description: "FHIR Bundle resource containing batch requests",
		example: {
			resourceType: "Bundle",
			type: "batch",
			entry: [
				{
					resource: {
						resourceType: "Patient",
						id: "1",
						name: [{ given: ["John"], family: "Doe" }],
					},
				},
			],
		},
	})
	@IsNotEmpty()
	@IsObject()
	bundle: any;

	@ApiProperty({
		description: "Optional context or specific requirements for summarization",
		example: "Focus on medical conditions and medications",
		required: false,
	})
	@IsOptional()
	@IsString()
	context?: string;
}

export class SummaryResponseDto {
	@ApiProperty({
		description: "Generated summary of the FHIR data",
		example: "Patient John Doe has diabetes and is taking metformin...",
	})
	summary: string;

	@ApiProperty({
		description: "Number of resources processed",
	})
	resourceCount: number;

	@ApiProperty({
		description: "Processing timestamp",
	})
	timestamp: string;
}
