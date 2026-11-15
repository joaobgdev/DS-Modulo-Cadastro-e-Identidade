import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('schedulesMfe/App').then((module) => ({ default: module.App }))
); 

export function SchedulesMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Agenda e fluxo assistencial">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Agenda e fluxo assistencial...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
