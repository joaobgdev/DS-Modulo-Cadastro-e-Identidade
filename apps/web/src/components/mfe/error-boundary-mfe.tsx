import { ErrorBoundary } from 'react-error-boundary';

interface ErrorBoundaryMfeProps {
  children: React.ReactNode;
  mfeName: string;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function DefaultMfeFallback({ error, resetErrorBoundary, mfeName }: { 
  error: Error; 
  resetErrorBoundary: () => void; 
  mfeName: string 
}) {
  const isNetworkError = 
    error.message?.includes('Failed to fetch dynamically imported module') ||
    error.name === 'TypeError' ||
    error.message?.includes('script error');

  return (
    <div className="p-5 m-3 border border-line bg-surface-muted rounded-lg shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="text-danger font-bold text-lg mt-0.5">⚠️</div>
        <div>
          <h3 className="text-sm font-semibold text-heading">
            O módulo <span className="font-mono text-accent-text font-bold">"{mfeName}"</span> falhou
          </h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {isNetworkError 
              ? 'O servidor deste módulo parece estar offline ou inacessível no momento.'
              : 'Ocorreu um erro inesperado durante a execução deste componente.'}
          </p>

          {import.meta.env.DEV && (
            <details className="mt-3">
              <summary className="text-[11px] text-muted cursor-pointer hover:underline select-none">
                Detalhes técnicos do erro
              </summary>
              <pre className="mt-2 p-2 bg-surface border border-line rounded text-[10px] text-body font-mono overflow-auto max-h-40">
                {error.stack || error.message}
              </pre>
            </details>
          )}

          <button
            onClick={resetErrorBoundary}
            className="mt-3.5 px-3 py-1.5 bg-surface border border-line hover:bg-surface-hover text-body text-xs font-medium rounded shadow-sm transition-colors cursor-pointer"
          >
            🔄 Tentar reconectar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundaryMfe({ children, mfeName, onError }: ErrorBoundaryMfeProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <DefaultMfeFallback
          error={toError(error)}
          resetErrorBoundary={resetErrorBoundary}
          mfeName={mfeName}
        />
      )}
      onError={(error, info) => {
        console.error(`[ErrorBoundaryMfe] Erro no MFE: ${mfeName}`, error, info);
        if (onError) onError(toError(error), info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}