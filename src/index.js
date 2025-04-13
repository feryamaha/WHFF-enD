import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
    console.error('Elemento com id "root" não encontrado no index.html');
} else {
    console.log('Montando React no elemento root');
    const root = createRoot(container);
    root.render(<App />);
}