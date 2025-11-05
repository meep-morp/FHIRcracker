# Getting Started with FHIRcracker

## 🚀 Quick Setup Guide

### Step 1: Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **NVIDIA API Key**: Get your API key from
   [NVIDIA Build](https://build.nvidia.com/minimaxai/minimax-m2)

### Step 2: Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd FHIRcracker

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 3: Configuration

Edit the `.env` file:

```env
# Required: Your NVIDIA API key
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxx

# Optional: Server configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Step 4: Start the Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Or build and run production
npm run build
npm run start:prod
```

### Step 5: Verify Installation

1. **Health Check**: Visit http://localhost:3000/api/fhir/health
2. **API Docs**: Visit http://localhost:3000/api/docs
3. **Test API**: Run `./test-api.bat` (Windows) or `./test-api.sh` (Linux/Mac)

## 📝 Usage Examples

### Basic FHIR Bundle Summarization

**Request:**

```bash
curl -X POST http://localhost:3000/api/fhir/summarize \
  -H "Content-Type: application/json" \
  -d @sample-data/patient-diabetes-bundle.json
```

**Response:**

```json
{
	"summary": "Patient Jane Smith is a 49-year-old female with Type 2 diabetes mellitus and essential hypertension. She is currently managed with Metformin 500mg twice daily for diabetes control and Lisinopril 10mg daily for blood pressure management. Recent laboratory results show an HbA1c of 7.2%, indicating suboptimal glycemic control that may require medication adjustment. Her blood pressure reading of 145/92 mmHg suggests her hypertension may also need optimization.",
	"resourceCount": 7,
	"timestamp": "2024-01-01T12:00:00.000Z"
}
```

### With Context

```bash
curl -X POST http://localhost:3000/api/fhir/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "bundle": { ... },
    "context": "Focus on medication adherence and recent lab results"
  }'
```

## 🔧 Development

### Project Structure

```
src/
├── controllers/          # REST API endpoints
├── services/            # Business logic
├── dto/                 # Data validation
├── interfaces/          # TypeScript types
├── config/              # Configuration
├── app.module.ts        # Main module
└── main.ts             # Bootstrap
```

### Available Scripts

- `npm run start:dev` - Development with hot reload
- `npm run start:debug` - Development with debugging
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run lint` - Run linter
- `npm run format` - Format code

### Adding New Features

1. **New FHIR Resources**: Update `src/services/fhir.service.ts`
2. **API Endpoints**: Update `src/controllers/fhir.controller.ts`
3. **Configuration**: Update `src/config/app.config.ts`

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build Docker image manually
docker build -t fhircracker .
docker run -p 3000:3000 -e NVIDIA_API_KEY=your-key fhircracker
```

## 🔍 Troubleshooting

### Common Issues

1. **"NVIDIA API key not configured"**
   - Set `NVIDIA_API_KEY` in your `.env` file
   - Restart the server after configuration

2. **"Cannot find module" errors**
   - Run `npm install` to install dependencies
   - Check Node.js version (requires 18+)

3. **API returns 500 errors**
   - Check server logs: `npm run start:dev`
   - Verify NVIDIA API key is valid
   - Check network connectivity

4. **CORS errors in browser**
   - Set `CORS_ORIGIN` in `.env` file
   - Use `CORS_ORIGIN=*` for development

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development LOG_LEVEL=debug npm run start:dev
```

### Health Monitoring

- **Service Health**: `GET /api/fhir/health`
- **NVIDIA API Status**: Included in health check response
- **Server Logs**: Check console output

## 📚 API Reference

### Endpoints

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | `/api/fhir/health`    | Health check          |
| GET    | `/api/fhir/info`      | Service information   |
| POST   | `/api/fhir/summarize` | Summarize FHIR bundle |

### FHIR Resources Supported

- Patient (demographics)
- Condition (diagnoses)
- Medication/MedicationRequest (prescriptions)
- Observation (labs, vitals)
- Procedure (medical procedures)
- DiagnosticReport (test results)
- Encounter (visits)
- AllergyIntolerance (allergies)
- Immunization (vaccines)

## 🛡️ Security

- Input validation on all endpoints
- Environment variable configuration
- CORS protection
- Rate limiting support
- No sensitive data in logs

## 📈 Performance

- Async/await patterns
- Connection pooling for HTTP requests
- Configurable timeouts
- Error handling and retries
- Memory-efficient FHIR processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and test
4. Submit pull request

## 🆘 Support

- 📖 Documentation: Available at `/api/docs` when server is running
- 🐛 Issues: Create GitHub issues for bugs
- 💬 Questions: Use GitHub discussions
- 📧 Contact: [Your contact information]
