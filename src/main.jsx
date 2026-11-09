import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider, CartProvider, ToastProvider } from './store'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider><AuthProvider><CartProvider><App /></CartProvider></AuthProvider></ToastProvider>
  </BrowserRouter>
)
