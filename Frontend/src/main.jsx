import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ChatProvider } from './contexts/ChatContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Import debug utilities in development
if (import.meta.env.DEV) {
  import('./utils/debugApi.js');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </BrowserRouter>
);