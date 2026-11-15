import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('suppliesMfe/App').then((module) => ({ default: module.App }))
); 

export function SuppliesMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Estoque e insumos">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Estoque e insumos...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
