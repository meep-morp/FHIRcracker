export interface FhirResource {
	resourceType: string;
	id?: string;
	[key: string]: any;
}

export interface FhirBundle {
	resourceType: "Bundle";
	type: "batch" | "transaction" | "searchset" | "collection";
	entry?: FhirBundleEntry[];
	total?: number;
}

export interface FhirBundleEntry {
	resource?: FhirResource;
	request?: {
		method: string;
		url: string;
	};
	response?: {
		status: string;
		location?: string;
	};
}

export interface PatientResource extends FhirResource {
	resourceType: "Patient";
	name?: {
		given?: string[];
		family?: string;
		use?: string;
	}[];
	gender?: "male" | "female" | "other" | "unknown";
	birthDate?: string;
	address?: any[];
	telecom?: any[];
}

export interface ConditionResource extends FhirResource {
	resourceType: "Condition";
	subject: {
		reference: string;
	};
	code: {
		coding: {
			system: string;
			code: string;
			display: string;
		}[];
		text?: string;
	};
	clinicalStatus?: {
		coding: {
			system: string;
			code: string;
		}[];
	};
}

export interface MedicationResource extends FhirResource {
	resourceType: "Medication" | "MedicationRequest";
	subject?: {
		reference: string;
	};
	medicationCodeableConcept?: {
		coding: {
			system: string;
			code: string;
			display: string;
		}[];
		text?: string;
	};
}

export interface ObservationResource extends FhirResource {
	resourceType: "Observation";
	subject: {
		reference: string;
	};
	code: {
		coding: {
			system: string;
			code: string;
			display: string;
		}[];
		text?: string;
	};
	valueQuantity?: {
		value: number;
		unit: string;
		system?: string;
		code?: string;
	};
	valueString?: string;
	valueCodeableConcept?: {
		coding: {
			system: string;
			code: string;
			display: string;
		}[];
		text?: string;
	};
}

export interface NvidiaRetrieverRequest {
	messages: {
		role: "system" | "user" | "assistant";
		content: string;
	}[];
	model: string;
	max_tokens?: number;
	temperature?: number;
	top_p?: number;
}

export interface NvidiaRetrieverResponse {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: {
		index: number;
		message: {
			role: string;
			content: string;
		};
		finish_reason: string;
	}[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}
