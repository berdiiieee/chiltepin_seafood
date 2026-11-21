import './css/styles.css'
import './css/components.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PreferenciasProvider } from './context/Preferencias'
import { CarritoProvider } from './context/Carrito'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PreferenciasProvider>
      <CarritoProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CarritoProvider>
    </PreferenciasProvider>
  </React.StrictMode>,
)
