import { registerAccessTokenReader } from '@meet/api';
import { createI18n } from '@meet/i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { readAuthSession } from './features/auth/model/auth-session-storage';
import './index.css';

registerAccessTokenReader(() => readAuthSession()?.accessToken ?? null);

async function start(): Promise<void> {
  createI18n();

  if (import.meta.env.DEV) {
    const { worker } = await import('@meet/mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element was not found.');
  }

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void start();
