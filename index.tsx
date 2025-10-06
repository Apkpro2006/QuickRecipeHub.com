
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Note: Ensure you have 'react-router-dom' installed in your project:
// npm install react-router-dom

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
