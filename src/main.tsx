import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Push Notifications and PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, data } = event.data;
          
          switch (type) {
            case 'NOTIFICATION_CLICK':
              // Handle notification click navigation
              if (data.url && data.url !== window.location.pathname) {
                window.location.href = data.url;
              }
              break;
              
            case 'NOTIFICATION_ACTION':
              // Handle notification action
              console.log('Notification action received:', data);
              // You can dispatch this to your notification service
              break;
              
            default:
              console.log('Unknown message from service worker:', event.data);
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add Google Analytics script (example)
if (process.env.NODE_ENV === 'production') {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX'; // Replace with your GA ID
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX'); // Replace with your GA ID
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);