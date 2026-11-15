import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('telehealthMfe/App').then((module) => ({ default: module.App }))
); 

export function TelehealthMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Telessaúde">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Telessaúde...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
