import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { SessionProvider } from './store/session.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
)
