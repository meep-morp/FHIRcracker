# FHIRcracker

🏥 **Summarizes large swaths of FHIR Resources via a fhir batch request using NVIDIA's NeMo
Retriever OCR AI**

FHIRcracker is a NestJS-based service that processes FHIR (Fast Healthcare Interoperability
Resources) batch data and generates intelligent, human-readable summaries using NVIDIA's NeMo
Retriever OCR AI model. Perfect for healthcare professionals who need to quickly understand complex
patient data across multiple FHIR resources.

## ✨ Features

- **AI-Powered Summarization**: Uses NVIDIA's NeMo Retriever OCR model for medical data
  summarization
- **FHIR Bundle Processing**: Handles FHIR Bundle resources with batch entries
- **Resource Recognition**: Automatically processes Patient, Condition, Medication, Observation, and
  other FHIR resources
- **Adaptive Summaries**: Generates 1-2 paragraphs based on data complexity
- **RESTful API**: Clean, documented API endpoints
- **Health Monitoring**: Built-in health checks for service and AI model availability
- **Type Safety**: Full TypeScript implementation with proper validation
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- NVIDIA API key (for NeMo Retriever OCR access)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd FHIRcracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your NVIDIA API key:

   ```env
   NVIDIA_API_KEY=your-nvidia-api-key-here
   PORT=3000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Access the API**
   - API Server: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/fhir/health

## 📖 API Usage

### Summarize FHIR Bundle

**POST** `/api/fhir/summarize`

Processes a FHIR Bundle and generates an AI-powered summary.

**Request Body:**

```json
{
	"bundle": {
		"resourceType": "Bundle",
		"type": "batch",
		"entry": [
			{
				"resource": {
					"resourceType": "Patient",
					"id": "patient-1",
					"name": [
						{
							"given": ["John"],
							"family": "Doe"
						}
					],
					"gender": "male",
					"birthDate": "1980-01-01"
				}
			},
			{
				"resource": {
					"resourceType": "Condition",
					"id": "condition-1",
					"subject": {
						"reference": "Patient/patient-1"
					},
					"code": {
						"coding": [
							{
								"system": "http://snomed.info/sct",
								"code": "73211009",
								"display": "Diabetes mellitus"
							}
						]
					},
					"clinicalStatus": {
						"coding": [
							{
								"system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
								"code": "active"
							}
						]
					}
				}
			}
		]
	},
	"context": "Focus on chronic conditions and current medications"
}
```

**Response:**

```json
{
	"summary": "The patient John Doe (male, DOB: 1980-01-01) has an active diagnosis of diabetes mellitus. This chronic condition requires ongoing management and monitoring. The patient's medical profile indicates a need for regular glucose monitoring and potential medication management to maintain optimal glycemic control.",
	"resourceCount": 2,
	"timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Health Check

**GET** `/api/fhir/health`

Returns service health status and NVIDIA API availability.

**Response:**

```json
{
	"status": "healthy",
	"timestamp": "2024-01-01T12:00:00.000Z",
	"services": {
		"fhir": "operational",
		"nvidia_retriever": "operational"
	}
}
```

### Service Information

**GET** `/api/fhir/info`

Returns information about the service capabilities.

## 🏗️ Architecture

```
src/
├── controllers/          # REST API controllers
│   └── fhir.controller.ts
├── services/            # Business logic
│   ├── fhir.service.ts
│   └── nvidia-retriever.service.ts
├── dto/                 # Data transfer objects
│   └── fhir.dto.ts
├── interfaces/          # TypeScript interfaces
│   └── fhir.interface.ts
├── config/              # Configuration
│   └── app.config.ts
├── app.module.ts        # Main application module
└── main.ts             # Application bootstrap
```

## 🔧 Configuration

### Environment Variables

| Variable         | Description                           | Default     | Required |
| ---------------- | ------------------------------------- | ----------- | -------- |
| `NVIDIA_API_KEY` | NVIDIA API key for NeMo Retriever OCR | -           | ✅       |
| `PORT`           | Server port                           | 3000        | ❌       |
| `NODE_ENV`       | Environment                           | development | ❌       |
| `CORS_ORIGIN`    | CORS origins                          | \*          | ❌       |
| `LOG_LEVEL`      | Logging level                         | info        | ❌       |
| `RATE_LIMIT`     | Requests per minute                   | 100         | ❌       |

### Supported FHIR Resources

- **Patient** - Demographics and identifiers
- **Condition** - Medical conditions and diagnoses
- **Medication/MedicationRequest** - Medications and prescriptions
- **Observation** - Vital signs, lab results, assessments
- **Procedure** - Medical procedures
- **DiagnosticReport** - Diagnostic test results
- **Encounter** - Healthcare encounters
- **AllergyIntolerance** - Allergies and intolerances
- **Immunization** - Vaccination records

## 🧪 Development

### Available Scripts

```bash
# Development
npm run start        # Start with hot reload
npm run start:debug      # Start with debugging

# Building
npm run build           # Build for production
npm run start:prod      # Start production build

# Testing
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Adding New FHIR Resource Types

1. Update the `FhirResource` interfaces in `src/interfaces/fhir.interface.ts`
2. Add processing logic in `src/services/fhir.service.ts`
3. Update the `extractResources` method to handle the new resource type
4. Add human-readable conversion logic

### Testing with Sample Data

Use the included Swagger UI at `/api/docs` to test the API with sample FHIR bundles.

## 🔐 Security

- Input validation using class-validator
- CORS configuration
- Rate limiting support
- Environment variable validation
- Secure API key handling

## 📈 Monitoring

- Health check endpoints
- Structured logging
- Error handling and reporting
- Service availability monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api/docs`
- Review the health check endpoint at `/api/fhir/health`
- Ensure your NVIDIA API key is properly configured

## 🔮 AI Model Information

This service uses NVIDIA's NeMo Retriever OCR model, specifically designed for medical data
processing:

- **Model**: `meta/llama-3.1-405b-instruct`
- **Context Window**: Variable based on model configuration
- **Specialization**: Medical data analysis and summarization with OCR capabilities
- **Provider**: NVIDIA NIM (NVIDIA Inference Microservices)

## 🔐 Getting Your NVIDIA API Key

To use FHIRcracker, you'll need an NVIDIA API key for the NeMo Retriever OCR model:

1. **Visit the NVIDIA Build Platform**

   Go to: [NVIDIA Build](https://build.nvidia.com/minimaxai/minimax-m2)

2. **Create an Account or Sign In**

   If you don't have an NVIDIA Developer account, you'll need to create one.

3. **Generate Your API Key**
   - Navigate to the integration section
   - Click "Get API Key" or similar option
   - Copy your generated API key

4. **Add to Your Environment**

   Add the key to your `.env` file:

   ```env
   NVIDIA_API_KEY=nvapi-your-actual-api-key-here
   ```

**Note**: Keep your API key secure and never commit it to version control.
