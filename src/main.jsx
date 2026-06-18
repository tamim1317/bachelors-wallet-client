import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider }    from './context/ThemeContext'
import { AuthProvider }     from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { MessProvider }     from './context/MessContext'
import { SocketProvider } from './context/SocketContext'
import { registerSW }       from './utils/pwa'
import './index.css'

registerSW();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <MessProvider>
            <SocketProvider>
            <App />
            </SocketProvider>
          </MessProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)