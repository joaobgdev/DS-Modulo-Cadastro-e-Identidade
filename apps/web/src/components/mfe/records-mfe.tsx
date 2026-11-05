import { lazy, Suspense } from 'react';
import { ErrorBoundaryMfe } from './error-boundary-mfe'; 

const RemoteApp = lazy(() => 
  import('recordsMfe/App').then((module) => ({ default: module.App }))
); 

export function RecordsMfe() {
  return (
    <ErrorBoundaryMfe mfeName="Prontuário Comum, Modelagem Clínica e Processos">
      <Suspense fallback={
          <div className="p-6 text-sm text-muted">
            Carregando Prontuário Comum, Modelagem Clínica e Processos...
          </div>
        }>
        <RemoteApp />
      </Suspense>
    </ErrorBoundaryMfe>
  );
}
