# # esse formato copia todo o código do repo e manda para dentro da imagem
# FROM eclipse-temurin:25-jdk
# WORKDIR /app
# COPY . .
# RUN chmod +x mvnw && ./mvnw clean package -DskipTests
# EXPOSE 8080
# CMD ["java", "-jar", "target/carbocat-0.0.1-SNAPSHOT.jar"]

# estágio de build
FROM eclipse-temurin:25-jdk AS build
# copia só o necessário pra resolver dependências
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline
# copia o cídgo
COPY src/ src/
RUN ./mvnw clean package -DskipTests
# renomeia pra um nome fixo independente da versao no pom.xml
RUN cp target/*.jar app.jar

# estágio de runtime
FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd -r spring && useradd -r -g spring spring
COPY --from=build /app/app.jar app.jar
RUN chown spring:spring app.jar
USER spring
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
CMD curl -f http://localhost:8080/api/v3/api-docs || exit 1
