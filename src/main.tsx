import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPalette } from './theme/runtime'

// Tokens must exist before the first paint.
initPalette();

createRoot(document.getElementById("root")!).render(
  <App />
);
