
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';

// @ts-ignore
const tg = (window as any).Telegram?.WebApp;
if (tg) { tg.expand(); tg.ready(); }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
