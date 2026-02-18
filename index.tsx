import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './src/App';
import './src/index.css';
import { LanguageProvider } from './src/i18n';

import { ThemeProvider } from './src/components/theme-provider';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <HashRouter>
      <LanguageProvider>
        <ThemeProvider storageKey="mcs-operaciones-theme">
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </HashRouter>
  </React.StrictMode>
);