import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('templatesMfe/App').then((module) => ({ default: module.App }))
); 

export function TemplatesMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Fichas Clínicas">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Fichas Clínicas...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
