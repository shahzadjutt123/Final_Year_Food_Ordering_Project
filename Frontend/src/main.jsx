import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ Google OAuth Provider
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StoreContextProvider>
  <GoogleOAuthProvider clientId="955567605330-d2b0na7gu9cm49v75g4rffeoenii6nb7.apps.googleusercontent.com">
  <App />
  </GoogleOAuthProvider>
  </StoreContextProvider>
  </BrowserRouter>
)
