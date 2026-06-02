import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { MessProvider } from './context/MessContext'
import { registerSW } from './utils/pwa'
import './index.css'

registerSW();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <MessProvider>
        <App />
      </MessProvider>
    </ThemeProvider>
  </React.StrictMode>
)