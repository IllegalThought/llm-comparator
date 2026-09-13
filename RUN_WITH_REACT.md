# Run Spring AI + React comparison UI

## 1. Start Ollama

```bash
ollama pull qwen3:8b
ollama serve
```

Ollama should be available at `http://localhost:11434`.

## 2. Start Spring Boot

From the project root:

```bash
export GEMINI_API_KEY="YOUR_NEW_GEMINI_KEY"
./mvnw spring-boot:run
```

Backend: `http://localhost:8080`

Available APIs:

- `POST /api/gemini/chat`
- `POST /api/ollama/chat`

## 3. Start React

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

The Vite development server proxies `/api/*` calls to the Spring Boot backend on port 8080.

## How the comparison works

React submits the same JSON body to both APIs at the same time:

```json
{
  "message": "Explain dependency injection"
}
```

Each result is rendered independently. If Gemini succeeds while Ollama is unavailable, the Gemini answer remains visible and the Ollama card shows its own error instead of failing the whole comparison.
