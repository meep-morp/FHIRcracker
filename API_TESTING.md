# API Testing Guide

## Testing the FHIRcracker API

### 1. Start the Server

```bash
npm run start:dev
```

The server will start on http://localhost:3000

### 2. Test with Sample Data

#### Using the provided sample files:

**Simple test:**

```bash
curl -X POST http://localhost:3000/api/fhir/summarize \
  -H "Content-Type: application/json" \
  -d @sample-data/simple-patient-bundle.json
```

**Complex test:**

```bash
curl -X POST http://localhost:3000/api/fhir/summarize \
  -H "Content-Type: application/json" \
  -d @sample-data/patient-diabetes-bundle.json
```

#### Manual test with inline JSON:

```bash
curl -X POST http://localhost:3000/api/fhir/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "bundle": {
      "resourceType": "Bundle",
      "type": "batch",
      "entry": [
        {
          "resource": {
            "resourceType": "Patient",
            "id": "test-patient",
            "name": [{"given": ["Test"], "family": "Patient"}],
            "gender": "male",
            "birthDate": "1990-01-01"
          }
        }
      ]
    },
    "context": "Provide basic patient summary"
  }'
```

### 3. Health Check

```bash
curl -X GET http://localhost:3000/api/fhir/health
```

### 4. Service Information

```bash
curl -X GET http://localhost:3000/api/fhir/info
```

### 5. API Documentation

Visit: http://localhost:3000/api/docs

## Important Notes

1. **Request Format**: The FHIR bundle must be wrapped in a `bundle` property
2. **Content-Type**: Must be `application/json`
3. **NVIDIA API Key**: Make sure you have set `NVIDIA_API_KEY` in your `.env` file
4. **Context Field**: Optional but helps focus the AI summary

## Expected Response Format

```json
{
	"summary": "Patient Test Patient is a 34-year-old male...",
	"resourceCount": 1,
	"timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Troubleshooting

### Common Errors:

1. **400 Bad Request - "bundle must be an object"**
   - Make sure your JSON has the bundle wrapped in a `bundle` property
   - Check that the JSON is valid

2. **500 Internal Server Error - "NVIDIA API key not configured"**
   - Set `NVIDIA_API_KEY` in your `.env` file
   - Restart the server after setting the environment variable

3. **Network errors**
   - Make sure the server is running on port 3000
   - Check firewall settings

4. **Model not found errors**
   - The service now uses `meta/llama-3.1-405b-instruct` which is a reliable NVIDIA model
   - Check the server logs to see the exact API requests being made, make sure to set LOG_LEVEL
     variable to `debug` for more information.
