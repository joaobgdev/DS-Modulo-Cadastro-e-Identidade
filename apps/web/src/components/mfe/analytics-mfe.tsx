import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('analyticsMfe/App').then((module) => ({ default: module.App }))
); 

export function AnalyticsMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Gestão e indicadores">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Gestão e indicadores...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
