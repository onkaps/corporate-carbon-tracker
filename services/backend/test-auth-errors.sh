#!/bin/bash

API_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "ERROR HANDLING TESTS"
echo "========================================"

# Test 1: Duplicate Email Registration
echo -e "\n${YELLOW}Test 1: Duplicate Email Registration${NC}"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "DUP001",
    "name": "Duplicate User",
    "email": "admin@greentech.com",
    "password": "test123456",
    "companyId": 1
  }')

if echo "$response" | grep -q "Email already registered"; then
    echo -e "${GREEN}✓ Duplicate email properly rejected${NC}"
else
    echo -e "${RED}✗ Duplicate email not properly rejected${NC}"
fi

# Test 2: Duplicate Employee ID
echo -e "\n${YELLOW}Test 2: Duplicate Employee ID${NC}"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "ADMIN001",
    "name": "Duplicate EmpID",
    "email": "newemail@greentech.com",
    "password": "test123456",
    "companyId": 1
  }')

if echo "$response" | grep -q "Employee ID already exists"; then
    echo -e "${GREEN}✓ Duplicate employee ID properly rejected${NC}"
else
    echo -e "${RED}✗ Duplicate employee ID not properly rejected${NC}"
fi

# Test 3: Invalid Company ID
echo -e "\n${YELLOW}Test 3: Invalid Company ID${NC}"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "INVALID001",
    "name": "Invalid Company",
    "email": "invalid@greentech.com",
    "password": "test123456",
    "companyId": 999
  }')

if echo "$response" | grep -q "Company not found"; then
    echo -e "${GREEN}✓ Invalid company properly rejected${NC}"
else
    echo -e "${RED}✗ Invalid company not properly rejected${NC}"
fi

# Test 4: Invalid Login Credentials
echo -e "\n${YELLOW}Test 4: Invalid Login Credentials${NC}"
response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greentech.com",
    "password": "wrongpassword"
  }')

if echo "$response" | grep -q "Invalid credentials"; then
    echo -e "${GREEN}✓ Invalid credentials properly rejected${NC}"
else
    echo -e "${RED}✗ Invalid credentials not properly rejected${NC}"
fi

# Test 5: Missing Required Fields
echo -e "\n${YELLOW}Test 5: Missing Required Fields${NC}"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "MISSING001",
    "name": "Missing Fields"
  }')

if echo "$response" | grep -q "email"; then
    echo -e "${GREEN}✓ Missing fields properly rejected${NC}"
else
    echo -e "${RED}✗ Missing fields not properly rejected${NC}"
fi

# Test 6: Short Password
echo -e "\n${YELLOW}Test 6: Short Password Validation${NC}"
response=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "SHORT001",
    "name": "Short Password",
    "email": "short@greentech.com",
    "password": "123",
    "companyId": 1
  }')

if echo "$response" | grep -q "password"; then
    echo -e "${GREEN}✓ Short password properly rejected${NC}"
else
    echo -e "${RED}✗ Short password not properly rejected${NC}"
fi

echo -e "\n========================================"
echo -e "${GREEN}ERROR HANDLING TESTS COMPLETED!${NC}"
echo "========================================"