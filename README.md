# Spring AI Dual-LLM Comparison App

A full-stack Spring AI demo that sends the same prompt to **Google Gemini 3.5 Flash** and a **local Qwen3 8B model through Ollama**, then displays both responses side by side in a React frontend.

The project is designed to demonstrate how Spring AI can work with both a cloud LLM provider and a locally hosted LLM in the same application.

## Features

- Compare **Gemini 3.5 Flash** and **Qwen3 8B** using the same prompt.
- Gemini integration through Spring AI and Google GenAI.
- Local LLM integration through Spring AI and Ollama.
- React + Vite frontend.
- Parallel requests to both models.
- Independent loading and error states for each model.
- Response-time comparison.
- Copy individual model responses.
- Example prompts for quick testing.
- Vite development proxy for `/api` requests.
- Gemini API key loaded through an environment variable instead of being hard-coded.

## Architecture

```text
                         User Prompt
                              |
                         React Frontend
                        localhost:5173
                              |
                +-------------+-------------+
                |                           |
                v                           v
      POST /api/gemini/chat       POST /api/ollama/chat
                |                           |
                v                           v
       GeminiController             OllamaController
                |                           |
                v                           v
           ChatClient                  ChatClient
                |                           |
                v                           v
      GoogleGenAiChatModel          OllamaChatModel
                |                           |
                v                           v
       Gemini 3.5 Flash          Ollama localhost:11434
                                             |
                                             v
                                         Qwen3 8B
```

## Tech Stack

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring AI 2.0.1
- Spring Web MVC
- Google GenAI Spring AI starter
- Ollama Spring AI starter
- Maven

### Frontend

- React 18
- Vite 5
- JavaScript
- CSS

### AI Models

- Google Gemini 3.5 Flash
- Qwen3 8B via Ollama

## Project Structure

```text
SpringAIDemo-React-LLM-Compare/
|
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   `-- ModelCard.jsx
|   |   |-- App.jsx
|   |   |-- api.js
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|
|-- src/
|   |-- main/
|   |   |-- java/com/shibu/SpringAIDemo/
|   |   |   |-- AiConfig.java
|   |   |   |-- GeminiController.java
|   |   |   |-- OllamaController.java
|   |   |   `-- SpringAiDemoApplication.java
|   |   `-- resources/
|   |       `-- application.properties
|   `-- test/
|
|-- pom.xml
|-- mvnw
|-- mvnw.cmd
`-- README.md
```

## Prerequisites

Install the following before running the project:

- Java 21
- Node.js 18+ and npm
- Ollama
- A Google AI Studio Gemini API key

Verify the installations:

```bash
java -version
node -v
npm -v
ollama --version
```

## 1. Prepare Ollama

Download the local Qwen model:

```bash
ollama pull qwen3:8b
```

Verify that the model is installed:

```bash
ollama list
```

You should see `qwen3:8b` in the list.

Start Ollama if it is not already running:

```bash
ollama serve
```

Ollama should be available at:

```text
http://localhost:11434
```

## 2. Configure Gemini

The backend reads the Gemini API key from the `GEMINI_API_KEY` environment variable.

On macOS/Linux:

```bash
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

On Windows PowerShell:

```powershell
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Do not commit the real API key to Git.

The relevant Spring configuration is:

```properties
spring.application.name=SpringAIDemo

spring.ai.model.chat=google-genai

spring.ai.google.genai.api-key=${GEMINI_API_KEY}
spring.ai.google.genai.chat.model=gemini-3.5-flash

spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.model=qwen3:8b
```

## 3. Run the Spring Boot Backend

From the project root:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

## 4. Run the React Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The React application runs at:

```text
http://localhost:5173
```

Open that URL in your browser.

## API Endpoints

### Gemini

```http
POST /api/gemini/chat
Content-Type: application/json
```

Request:

```json
{
  "message": "Explain dependency injection in simple words."
}
```

Response:

```json
{
  "response": "...Gemini response..."
}
```

### Ollama

```http
POST /api/ollama/chat
Content-Type: application/json
```

Request:

```json
{
  "message": "Explain dependency injection in simple words."
}
```

Response:

```json
{
  "response": "...Qwen response..."
}
```

## How the React Comparison Works

When the user presses **Compare both models**, the React frontend sends two requests in parallel:

```javascript
Promise.allSettled([
  runModel('/api/gemini/chat', setGemini),
  runModel('/api/ollama/chat', setOllama),
]);
```

This means Gemini and Ollama process the same prompt independently.

If one model fails, the other model can still finish and display its response.

The frontend also records the time taken by each request so the user can compare latency as well as response quality.

## Why `AiConfig.java` Is Needed

The application uses:

```properties
spring.ai.model.chat=google-genai
```

so Spring AI auto-configures the Gemini model.

Because the project also needs Ollama at the same time, `AiConfig.java` manually creates a second `OllamaChatModel` bean:

```java
@Configuration
public class AiConfig {

    @Bean
    public OllamaChatModel ollamaChatModel() {

        OllamaApi ollamaApi = OllamaApi.builder()
                .baseUrl("http://localhost:11434")
                .build();

        return OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .options(
                        OllamaChatOptions.builder()
                                .model("qwen3:8b")
                                .build()
                )
                .build();
    }
}
```

This allows both models to exist in the same Spring application:

```text
Spring Container
|
|-- GoogleGenAiChatModel  -> GeminiController
`-- OllamaChatModel       -> OllamaController
```

## Vite Proxy

During development, React runs on port `5173` while Spring Boot runs on port `8080`.

The Vite configuration proxies `/api` calls to Spring Boot:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

Because of this, React can call:

```javascript
fetch('/api/gemini/chat')
```

instead of hard-coding:

```text
http://localhost:8080/api/gemini/chat
```

## Common Errors

### Gemini returns 401 / UNAUTHENTICATED

Check that `GEMINI_API_KEY` is set correctly and that the key works with the Gemini API.

```bash
echo ${#GEMINI_API_KEY}
```

Do not print or share the actual key.

### Spring cannot find `OllamaChatModel`

Make sure `AiConfig.java` exists and contains the `@Bean` that creates `OllamaChatModel`.

### Ollama request fails

Check that Ollama is running:

```bash
ollama list
```

and verify the server:

```bash
curl http://localhost:11434/api/tags
```

Also verify that `qwen3:8b` is installed.

### React cannot reach the backend

Make sure Spring Boot is running on port `8080` before starting or using the React frontend.

### Port already in use

If `8080`, `5173`, or `11434` is already occupied, stop the conflicting process or change the corresponding application configuration.

## Security Notes

- Never store the Gemini API key directly in `application.properties`.
- Never commit `.env` files containing secrets.
- Keep the API key only on the backend; the React frontend should never receive it.
- Ollama remains local unless you intentionally expose its server to the network.

## Current Limitations

This is currently a comparison/demo application. It does not yet include:

- Conversation history
- Streaming responses
- Authentication
- Persistent chat storage
- RAG/vector databases
- Tool/function calling
- Model parameter controls such as temperature
- Automated quality scoring between model answers

## Possible Next Steps

Useful extensions for the project include:

1. Add conversation history for both models.
2. Stream tokens to React using Server-Sent Events or WebSockets.
3. Add a single backend comparison endpoint instead of two frontend requests.
4. Add model selection and temperature controls.
5. Add RAG using Spring AI vector stores.
6. Add automatic evaluation to score Gemini and Ollama responses for accuracy, latency, and length.
7. Store prompts and model responses in a database for later analysis.

## Development Flow

```text
React UI
   |
   | same prompt
   v
Spring Boot
   |
   +--> GeminiController --> Gemini 3.5 Flash
   |
   `--> OllamaController --> Qwen3 8B

Results return independently
   |
   v
React renders both responses side by side
```

## Purpose

The project is intended as a practical Spring AI learning project for understanding:

- Spring AI `ChatClient`
- Multiple LLM providers in one Spring Boot application
- Cloud vs local LLM integration
- Dependency injection and Spring beans
- REST API design
- React-to-Spring communication
- Comparative LLM testing

---

Built with **Spring Boot + Spring AI + React + Gemini + Ollama**.
