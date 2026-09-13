import { useState } from 'react';

function StatusBadge({ status }) {
  const labels = {
    idle: 'Ready',
    loading: 'Thinking',
    success: 'Completed',
    error: 'Failed',
  };

  return <span className={`status status--${status}`}>{labels[status]}</span>;
}

export default function ModelCard({
  accent,
  description,
  latency,
  model,
  provider,
  result,
  status,
}) {
  const [copied, setCopied] = useState(false);

  const copyResponse = async () => {
    if (!result || status !== 'success') return;

    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article className={`model-card model-card--${accent}`}>
      <header className="model-card__header">
        <div className="model-identity">
          <div className="model-logo" aria-hidden="true">
            {provider.charAt(0)}
          </div>
          <div>
            <div className="model-provider">{provider}</div>
            <h2>{model}</h2>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      <p className="model-description">{description}</p>

      <div className="response-panel" aria-live="polite">
        {status === 'idle' && (
          <div className="empty-state">
            <span className="empty-state__mark">?</span>
            <p>Submit a prompt to see this model's answer.</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="loading-state">
            <div className="loader" />
            <div>
              <strong>Generating response</strong>
              <p>This model is processing the same prompt.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="response-copy">
            <p>{result}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="error-state">
            <strong>Request failed</strong>
            <p>{result}</p>
          </div>
        )}
      </div>

      <footer className="model-card__footer">
        <span>{latency != null ? `${latency} ms` : '— ms'}</span>
        <button
          className="copy-button"
          disabled={status !== 'success'}
          onClick={copyResponse}
          type="button"
        >
          {copied ? 'Copied' : 'Copy answer'}
        </button>
      </footer>
    </article>
  );
}
