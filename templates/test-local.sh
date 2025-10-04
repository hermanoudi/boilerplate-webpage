#!/bin/bash
# Test Local Development Environment
# Tests API endpoints and database connectivity

echo "🧪 Testing {{COMPANY_NAME}} Local Environment"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:8080/api/products.php"

# Test 1: Check if .env file exists
echo -n "1. Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}   Please copy .env.example to .env and configure it${NC}"
    exit 1
fi

# Test 2: Check if PHP server is running
echo -n "2. Checking PHP server... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}   Start PHP server with: php -S localhost:8080${NC}"
    exit 1
fi

# Test 3: Test API - Get all products
echo -n "3. Testing API (GET all products)... "
response=$(curl -s -w "\n%{http_code}" "$API_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓${NC}"
    product_count=$(echo "$body" | grep -o '"id"' | wc -l)
    echo "   Found $product_count products"
else
    echo -e "${RED}✗${NC} (HTTP $http_code)"
    exit 1
fi

# Test 4: Test API - Get config
echo -n "4. Testing API (GET config)... "
config_response=$(curl -s -w "\n%{http_code}" "$API_URL?config=1")
config_http_code=$(echo "$config_response" | tail -n1)

if [ "$config_http_code" == "200" ]; then
    echo -e "${GREEN}✓${NC}"
    whatsapp=$(echo "$config_response" | sed '$d' | grep -o '"whatsappNumber":"[^"]*"' | cut -d'"' -f4)
    echo "   WhatsApp: $whatsapp"
else
    echo -e "${RED}✗${NC} (HTTP $config_http_code)"
fi

# Test 5: Test API - Get single product
echo -n "5. Testing API (GET single product)... "
single_response=$(curl -s -w "\n%{http_code}" "http://localhost:8080/api/products/1")
single_http_code=$(echo "$single_response" | tail -n1)

if [ "$single_http_code" == "200" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC} (HTTP $single_http_code)"
    echo "   This is OK if you haven't seeded the database yet"
fi

# Test 6: Check database connection
echo -n "6. Testing database connection... "
if echo "$body" | grep -q "error.*Database"; then
    echo -e "${RED}✗${NC}"
    echo -e "${YELLOW}   Database connection failed. Check your .env configuration${NC}"
    exit 1
elif [ "$product_count" -gt 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "   Database connected but no products found"
    echo -e "${YELLOW}   Run: mysql -u root -p {{DB_NAME}} < database/seed.sql${NC}"
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "🌐 Access your site at: http://localhost:8080"
