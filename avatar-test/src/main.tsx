import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <- tu archivo principal
import './index.css'; // opcional, si usas estilos

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
