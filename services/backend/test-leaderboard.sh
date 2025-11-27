#!/bin/bash

API_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "LEADERBOARD SYSTEM TEST"
echo "========================================"

# Test 1: Login
echo -e "\n${YELLOW}Test 1: Login${NC}"
login_response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greentech.com",
    "password": "admin123"
  }')

TOKEN=$(echo $login_response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."

# Test 2: Employee Leaderboard
echo -e "\n${YELLOW}Test 2: Employee Leaderboard${NC}"
leaderboard_response=$(curl -s $API_URL/leaderboard/employees?limit=5 \
  -H "Authorization: Bearer $TOKEN")

if echo "$leaderboard_response" | grep -q "rank"; then
    echo -e "${GREEN}✓ Employee leaderboard retrieved${NC}"
    echo "Response preview:"
    echo "$leaderboard_response" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Employee leaderboard failed${NC}"
    echo "Response: $leaderboard_response"
fi

# Test 3: Department Rankings
echo -e "\n${YELLOW}Test 3: Department Rankings${NC}"
dept_response=$(curl -s $API_URL/leaderboard/departments \
  -H "Authorization: Bearer $TOKEN")

if echo "$dept_response" | grep -q "department"; then
    echo -e "${GREEN}✓ Department rankings retrieved${NC}"
    echo "Response preview:"
    echo "$dept_response" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Department rankings failed${NC}"
fi

# Test 4: My Rank
echo -e "\n${YELLOW}Test 4: Get My Rank${NC}"
rank_response=$(curl -s $API_URL/leaderboard/my-rank \
  -H "Authorization: Bearer $TOKEN")

if echo "$rank_response" | grep -q -E "rank|message"; then
    echo -e "${GREEN}✓ My rank retrieved${NC}"
    echo "Response: $rank_response"
else
    echo -e "${RED}✗ My rank failed${NC}"
fi

# Test 5: Achievements
echo -e "\n${YELLOW}Test 5: Get Achievements${NC}"
achievements_response=$(curl -s $API_URL/leaderboard/achievements/1 \
  -H "Authorization: Bearer $TOKEN")

if echo "$achievements_response" | grep -q -E "\[|\{"; then
    echo -e "${GREEN}✓ Achievements retrieved${NC}"
    echo "Response preview:"
    echo "$achievements_response" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Achievements failed${NC}"
fi

# Test 6: Monthly Trends
echo -e "\n${YELLOW}Test 6: Monthly Trends${NC}"
trends_response=$(curl -s "$API_URL/leaderboard/trends?months=3" \
  -H "Authorization: Bearer $TOKEN")

if echo "$trends_response" | grep -q "month"; then
    echo -e "${GREEN}✓ Monthly trends retrieved${NC}"
    echo "Response preview:"
    echo "$trends_response" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Monthly trends failed${NC}"
fi

# Test 7: Performance Comparison
echo -e "\n${YELLOW}Test 7: Performance Comparison${NC}"
compare_response=$(curl -s $API_URL/leaderboard/compare \
  -H "Authorization: Bearer $TOKEN")

if echo "$compare_response" | grep -q "companyAverage"; then
    echo -e "${GREEN}✓ Performance comparison retrieved${NC}"
    echo "Response: $compare_response"
else
    echo -e "${RED}✗ Performance comparison failed${NC}"
fi

# Test 8: Company Rankings
echo -e "\n${YELLOW}Test 8: Company Rankings${NC}"
companies_response=$(curl -s "$API_URL/leaderboard/companies?limit=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$companies_response" | grep -q -E "\[|\{"; then
    echo -e "${GREEN}✓ Company rankings retrieved${NC}"
    echo "Response preview:"
    echo "$companies_response" | head -c 200
    echo "..."
else
    echo -e "${RED}✗ Company rankings failed${NC}"
fi

echo -e "\n========================================"
echo -e "${GREEN}ALL LEADERBOARD TESTS COMPLETED!${NC}"
echo "========================================"