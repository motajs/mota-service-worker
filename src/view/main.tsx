import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@/base/theme.less';
import './index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DarkModeStore } from '@/base/store/darkMode';
import DarkModeEffectSemi from '@/base/components/DarkModeEffect/semi.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <DarkModeStore.Provider>
        <DarkModeEffectSemi />
        <App />
      </DarkModeStore.Provider>
    </QueryClientProvider>
  </StrictMode>,
)
