import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-accent-start animate-pulse text-2xl font-bold">SpendWise</div>
      </div>
    }>
      <App />
    </Suspense>
  </StrictMode>
);
