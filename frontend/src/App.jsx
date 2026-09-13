import { useMemo, useState } from 'react';
import { askModel } from './api';
import ModelCard from './components/ModelCard';

const EMPTY_MODEL = {
  status: 'idle',
  result: '',
  latency: null,
};

const EXAMPLE_PROMPTS = [
  'Explain dependency injection in simple words.',
  'Compare REST and GraphQL with one example.',
  'Write a Java method to reverse a string.',
];

export default function App() {
  const [message, setMessage] = useState('');
  const [gemini, setGemini] = useState(EMPTY_MODEL);
  const [ollama, setOllama] = useState(EMPTY_MODEL);

  const isRunning = useMemo(
    () => gemini.status === 'loading' || ollama.status === 'loading',
    [gemini.status, ollama.status],
  );

  const runModel = async (endpoint, setter) => {
    const startedAt = performance.now();
    setter({ status: 'loading', result: '', latency: null });

    try {
      const result = await askModel(endpoint, message.trim());
      setter({
        status: 'success',
        result,
        latency: Math.round(performance.now() - startedAt),
      });
    } catch (error) {
      setter({
        status: 'error',
        result: error instanceof Error ? error.message : 'Unknown request error.',
        latency: Math.round(performance.now() - startedAt),
      });
    }
  };

  const compareModels = async (event) => {
    event?.preventDefault();

    if (!message.trim() || isRunning) return;

    await Promise.allSettled([
      runModel('/api/gemini/chat', setGemini),
      runModel('/api/ollama/chat', setOllama),
    ]);
  };

  const clearAll = () => {
    if (isRunning) return;
    setMessage('');
    setGemini(EMPTY_MODEL);
    setOllama(EMPTY_MODEL);
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      compareModels(event);
    }
  };

  return (
    <main className="app-shell">
      <div className="background-orb background-orb--one" />
      <div className="background-orb background-orb--two" />

      <section className="hero">
        <div className="eyebrow">
          <span className="eyebrow__dot" />
          Spring AI · Dual-model playground
        </div>
        <h1>Ask once. Compare <span>two LLMs.</span></h1>
        <p>
          Send the exact same prompt to Gemini 3.5 Flash and your local
          Qwen3 8B model through Ollama, then inspect both answers side by side.
        </p>
      </section>

      <form className="prompt-card" onSubmit={compareModels}>
        <div className="prompt-card__label-row">
          <label htmlFor="prompt">Your prompt</label>
          <span>{message.length} characters</span>
        </div>

        <textarea
          autoFocus
          disabled={isRunning}
          id="prompt"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask both models anything..."
          rows={5}
          value={message}
        />

        <div className="example-prompts" aria-label="Example prompts">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              disabled={isRunning}
              key={prompt}
              onClick={() => setMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="prompt-card__actions">
          <span className="shortcut">⌘/Ctrl + Enter to compare</span>
          <div className="action-buttons">
            <button
              className="button button--secondary"
              disabled={isRunning || (!message && gemini.status === 'idle' && ollama.status === 'idle')}
              onClick={clearAll}
              type="button"
            >
              Clear
            </button>
            <button
              className="button button--primary"
              disabled={!message.trim() || isRunning}
              type="submit"
            >
              {isRunning ? 'Comparing…' : 'Compare both models'}
            </button>
          </div>
        </div>
      </form>

      <section className="comparison-heading">
        <div>
          <span className="section-kicker">Results</span>
          <h2>Side-by-side responses</h2>
        </div>
        <p>Each request is independent, so one model can still finish if the other fails.</p>
      </section>

      <section className="comparison-grid">
        <ModelCard
          accent="gemini"
          description="Cloud-hosted Google model, called through Spring AI."
          latency={gemini.latency}
          model="Gemini 3.5 Flash"
          provider="Gemini"
          result={gemini.result}
          status={gemini.status}
        />

        <ModelCard
          accent="ollama"
          description="Qwen running locally through your Ollama server."
          latency={ollama.latency}
          model="Qwen3 8B"
          provider="Ollama"
          result={ollama.result}
          status={ollama.status}
        />
      </section>

      <footer className="page-footer">
        <span>React + Vite</span>
        <span>Spring Boot API · localhost:8080</span>
      </footer>
    </main>
  );
}
