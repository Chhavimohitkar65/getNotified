#!/bin/bash
echo "---------------------------------------------"
echo "Testing rate limiter (2 requests per 30 seconds)"
echo "---------------------------------------------"

echo -e "\n[1] First request (should succeed):"
curl -i -X GET 'http://localhost:8000/api/v1/notifications' -H 'Authorization: Bearer test-api-key'

echo -e "\n\n[2] Second request (should succeed):"
curl -i -X GET 'http://localhost:8000/api/v1/notifications' -H 'Authorization: Bearer test-api-key'

echo -e "\n\n[3] Third request (should be rate limited with 429 response):"
curl -i -X GET 'http://localhost:8000/api/v1/notifications' -H 'Authorization: Bearer test-api-key'

echo -e "\n---------------------------------------------"
echo "Test complete."
echo "---------------------------------------------"
