import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installFetchInterceptor } from './services/installFetchInterceptor';

// Initialize resilient API fallback immediately for Vercel, serverless, and offline environments
installFetchInterceptor();

createRoot(document.getElementById('root')!).render(<App />);
