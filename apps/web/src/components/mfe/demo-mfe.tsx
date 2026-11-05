import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('demoMfe/App').then((module) => ({ default: module.App }))
);

export function DemoMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Demo">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando demo...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
