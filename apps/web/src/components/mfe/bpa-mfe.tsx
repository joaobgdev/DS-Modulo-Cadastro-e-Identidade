import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('bpaMfe/App').then((module) => ({ default: module.App }))
); 

export function BpaMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Produção e BPA">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Produção e BPA...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
