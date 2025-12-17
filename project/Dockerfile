FROM gradle:8.5-jdk21-alpine AS build

WORKDIR /app

COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle

COPY src src

RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Находим и копируем единственный исполняемый jar
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]