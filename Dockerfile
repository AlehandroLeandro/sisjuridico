FROM node:24-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

ARG VITE_USE_MOCKS=false
ARG VITE_API_BASE_URL=/api/
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM eclipse-temurin:25-jdk AS backend-build

WORKDIR /app

COPY backend/.mvn/ .mvn/
COPY backend/mvnw backend/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline

COPY backend/src/ src/
COPY --from=frontend-build /frontend/dist/ src/main/resources/static/
RUN ./mvnw clean package -DskipTests
RUN cp target/*.jar app.jar

FROM eclipse-temurin:25-jre

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r spring && useradd -r -g spring spring

COPY --from=backend-build /app/app.jar app.jar
RUN chown spring:spring app.jar

USER spring

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/api/v3/api-docs || exit 1

CMD ["java", "-jar", "app.jar"]
