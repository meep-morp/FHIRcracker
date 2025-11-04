@echo off
REM FHIRcracker API Test Script (Windows)
REM Make sure the server is running first: npm run start:dev

set BASE_URL=http://localhost:3000/api

echo 🏥 FHIRcracker API Test Script
echo ===============================

REM Test 1: Health Check
echo.
echo 1. Testing Health Check...
curl -X GET "%BASE_URL%/fhir/health" -H "Content-Type: application/json"

REM Test 2: Service Info  
echo.
echo.
echo 2. Testing Service Info...
curl -X GET "%BASE_URL%/fhir/info" -H "Content-Type: application/json"

REM Test 3: FHIR Bundle Summarization
echo.
echo.
echo 3. Testing FHIR Bundle Summarization...
curl -X POST "%BASE_URL%/fhir/summarize" ^
  -H "Content-Type: application/json" ^
  -d "{\"bundle\":{\"resourceType\":\"Bundle\",\"type\":\"batch\",\"entry\":[{\"resource\":{\"resourceType\":\"Patient\",\"id\":\"patient-123\",\"name\":[{\"given\":[\"Jane\"],\"family\":\"Smith\"}],\"gender\":\"female\",\"birthDate\":\"1975-03-15\"}},{\"resource\":{\"resourceType\":\"Condition\",\"id\":\"condition-diabetes\",\"subject\":{\"reference\":\"Patient/patient-123\"},\"code\":{\"coding\":[{\"system\":\"http://snomed.info/sct\",\"code\":\"44054006\",\"display\":\"Type 2 diabetes mellitus\"}],\"text\":\"Type 2 diabetes mellitus\"},\"clinicalStatus\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/condition-clinical\",\"code\":\"active\"}]}}},{\"resource\":{\"resourceType\":\"MedicationRequest\",\"id\":\"medication-metformin\",\"subject\":{\"reference\":\"Patient/patient-123\"},\"medicationCodeableConcept\":{\"coding\":[{\"system\":\"http://www.nlm.nih.gov/research/umls/rxnorm\",\"code\":\"6809\",\"display\":\"Metformin\"}],\"text\":\"Metformin 500mg twice daily\"}}}]},\"context\":\"Focus on chronic conditions and current medications\"}"

echo.
echo.
echo ✅ Test completed!
echo 📚 API Documentation: http://localhost:3000/api/docs