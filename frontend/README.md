# React frontend — Gemini vs Ollama

This Vite/React app sends one prompt to both Spring Boot endpoints and renders the responses side by side.

## Backend endpoints used

- `POST /api/gemini/chat`
- `POST /api/ollama/chat`

Both receive:

```json
{
  "message": "Your prompt"
}
```

and are expected to return:

```json
{
  "response": "Model answer"
}
```

## Run locally

1. Start Ollama and make sure the model exists:

   ```bash
   ollama pull qwen3:8b
   ollama serve
   ```

2. In the Spring Boot project root, set your Gemini key and run the backend:

   ```bash
   export GEMINI_API_KEY="YOUR_NEW_KEY"
   ./mvnw spring-boot:run
   ```

   The backend should run at `http://localhost:8080`.

3. In another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`.

Vite proxies every `/api/*` request to Spring Boot on port 8080, so no browser CORS setup is needed for local development.
