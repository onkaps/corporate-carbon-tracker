#!/bin/bash

API_URL="http://localhost:3000/api/v1"

echo "========================================"
echo "AUTHENTICATION SYSTEM TEST"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $response)${NC}"
fi

# Test 2: Register
echo -e "\n${YELLOW}Test 2: Register New Employee${NC}"
register_response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "name": "Test Employee",
    "email": "autotest@greentech.com",
    "password": "test123456",
    "department": "Testing",
    "position": "Tester",
    "companyId": 1
  }')

if echo "$register_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Response: $register_response" | head -c 100
    echo "..."
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "Response: $register_response"
fi

# Test 3: Login
echo -e "\n${YELLOW}Test 3: Login${NC}"
login_response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greentech.com",
    "password": "admin123"
  }')

if echo "$login_response" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo $login_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "Token received: ${TOKEN:0:20}..."
else
    echo