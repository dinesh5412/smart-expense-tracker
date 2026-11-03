#!/usr/bin/env bash
cd "$(dirname "$0")/backend"
PROFILE="${1:-h2}"

echo "==================================================="
echo "  Smart Expense & Budget Tracker - Spring Boot"
echo "==================================================="
echo "Starting Spring Boot backend with profile [${PROFILE}]..."
echo "API server will be available at: http://localhost:8080/api"
echo ""

if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run -Dspring-boot.run.profiles="${PROFILE}"
else
    mvn spring-boot:run -Dspring-boot.run.profiles="${PROFILE}"
fi
