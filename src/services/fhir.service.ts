import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import {
	FhirBundle,
	FhirResource,
	PatientResource,
	ConditionResource,
	MedicationResource,
	ObservationResource,
} from "../interfaces/fhir.interface";

@Injectable()
export class FhirService {
	private readonly logger = new Logger(FhirService.name);

	/**
	 * Validates and processes a FHIR bundle
	 * @param bundle - The FHIR Bundle to process
	 * @returns Processed and validated bundle
	 */
	validateAndProcessBundle(bundle: any): FhirBundle {
		if (!bundle || typeof bundle !== "object") {
			throw new BadRequestException("Invalid bundle: must be an object");
		}

		if (bundle.resourceType !== "Bundle") {
			throw new BadRequestException('Invalid bundle: resourceType must be "Bundle"');
		}

		if (!bundle.type) {
			throw new BadRequestException("Invalid bundle: type is required");
		}

		if (!Array.isArray(bundle.entry)) {
			bundle.entry = [];
		}

		this.logger.log(`Processing FHIR Bundle with ${bundle.entry.length} entries`);

		return bundle as FhirBundle;
	}

	/**
	 * Extracts and categorizes resources from a FHIR bundle
	 * @param bundle - The FHIR Bundle
	 * @returns Categorized resources
	 */
	extractResources(bundle: FhirBundle) {
		const resources = {
			patients: [] as PatientResource[],
			conditions: [] as ConditionResource[],
			medications: [] as MedicationResource[],
			observations: [] as ObservationResource[],
			other: [] as FhirResource[],
		};

		if (!bundle.entry) {
			return resources;
		}

		for (const entry of bundle.entry) {
			if (!entry.resource) continue;

			const resource = entry.resource;

			switch (resource.resourceType) {
				case "Patient":
					resources.patients.push(resource as PatientResource);
					break;
				case "Condition":
					resources.conditions.push(resource as ConditionResource);
					break;
				case "Medication":
				case "MedicationRequest":
					resources.medications.push(resource as MedicationResource);
					break;
				case "Observation":
					resources.observations.push(resource as ObservationResource);
					break;
				default:
					resources.other.push(resource);
			}
		}

		this.logger.debug(
			`Extracted resources: ${resources.patients.length} patients, ${resources.conditions.length} conditions, ${resources.medications.length} medications, ${resources.observations.length} observations, ${resources.other.length} other`
		);

		return resources;
	}

	/**
	 * Converts FHIR resources to a human-readable format for AI processing
	 * @param resources - Categorized FHIR resources
	 * @returns Human-readable text representation
	 */
	convertToHumanReadable(resources: ReturnType<typeof this.extractResources>): string {
		let text = "";

		// Process patients
		if (resources.patients.length > 0) {
			text += "PATIENTS:\n";
			resources.patients.forEach((patient, index) => {
				const name = this.extractPatientName(patient);
				const demographics = this.extractPatientDemographics(patient);
				text += `${index + 1}. ${name}${demographics}\n`;
			});
			text += "\n";
		}

		// Process conditions
		if (resources.conditions.length > 0) {
			text += "MEDICAL CONDITIONS:\n";
			resources.conditions.forEach((condition, index) => {
				const conditionText = this.extractConditionText(condition);
				text += `${index + 1}. ${conditionText}\n`;
			});
			text += "\n";
		}

		// Process medications
		if (resources.medications.length > 0) {
			text += "MEDICATIONS:\n";
			resources.medications.forEach((medication, index) => {
				const medicationText = this.extractMedicationText(medication);
				text += `${index + 1}. ${medicationText}\n`;
			});
			text += "\n";
		}

		// Process observations
		if (resources.observations.length > 0) {
			text += "OBSERVATIONS/VITAL SIGNS:\n";
			resources.observations.forEach((observation, index) => {
				const observationText = this.extractObservationText(observation);
				text += `${index + 1}. ${observationText}\n`;
			});
			text += "\n";
		}

		// Process other resources
		if (resources.other.length > 0) {
			text += "OTHER RESOURCES:\n";
			resources.other.forEach((resource, index) => {
				text += `${index + 1}. ${resource.resourceType} (ID: ${resource.id || "unknown"})\n`;
			});
		}

		return text;
	}

	private extractPatientName(patient: PatientResource): string {
		if (!patient.name || patient.name.length === 0) {
			return `Patient ID: ${patient.id || "unknown"}`;
		}

		const name = patient.name[0];
		const given = name.given ? name.given.join(" ") : "";
		const family = name.family || "";

		return `${given} ${family}`.trim() || `Patient ID: ${patient.id || "unknown"}`;
	}

	private extractPatientDemographics(patient: PatientResource): string {
		const demographics = [];

		if (patient.gender) {
			demographics.push(`Gender: ${patient.gender}`);
		}

		if (patient.birthDate) {
			demographics.push(`DOB: ${patient.birthDate}`);
		}

		return demographics.length > 0 ? ` (${demographics.join(", ")})` : "";
	}

	private extractConditionText(condition: ConditionResource): string {
		let text = "";

		if (condition.code?.text) {
			text = condition.code.text;
		} else if (condition.code?.coding && condition.code.coding.length > 0) {
			text = condition.code.coding[0].display || condition.code.coding[0].code;
		} else {
			text = "Unknown condition";
		}

		if (condition.subject?.reference) {
			text += ` (Patient: ${condition.subject.reference})`;
		}

		if (condition.clinicalStatus?.coding?.[0]?.code) {
			text += ` - Status: ${condition.clinicalStatus.coding[0].code}`;
		}

		return text;
	}

	private extractMedicationText(medication: MedicationResource): string {
		let text = "";

		if (medication.medicationCodeableConcept?.text) {
			text = medication.medicationCodeableConcept.text;
		} else if (
			medication.medicationCodeableConcept?.coding &&
			medication.medicationCodeableConcept.coding.length > 0
		) {
			text =
				medication.medicationCodeableConcept.coding[0].display ||
				medication.medicationCodeableConcept.coding[0].code;
		} else {
			text = "Unknown medication";
		}

		if (medication.subject?.reference) {
			text += ` (Patient: ${medication.subject.reference})`;
		}

		return text;
	}

	private extractObservationText(observation: ObservationResource): string {
		let text = "";

		// Get observation name
		if (observation.code?.text) {
			text = observation.code.text;
		} else if (observation.code?.coding && observation.code.coding.length > 0) {
			text = observation.code.coding[0].display || observation.code.coding[0].code;
		} else {
			text = "Unknown observation";
		}

		// Get observation value
		if (observation.valueQuantity) {
			text += `: ${observation.valueQuantity.value} ${observation.valueQuantity.unit || ""}`;
		} else if (observation.valueString) {
			text += `: ${observation.valueString}`;
		} else if (observation.valueCodeableConcept?.text) {
			text += `: ${observation.valueCodeableConcept.text}`;
		} else if (observation.valueCodeableConcept?.coding?.[0]?.display) {
			text += `: ${observation.valueCodeableConcept.coding[0].display}`;
		}

		if (observation.subject?.reference) {
			text += ` (Patient: ${observation.subject.reference})`;
		}

		return text;
	}

	/**
	 * Counts total resources in a bundle
	 * @param bundle - The FHIR Bundle
	 * @returns Total number of resources
	 */
	countResources(bundle: FhirBundle): number {
		return bundle.entry?.length || 0;
	}
}
