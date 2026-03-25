import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import RegisterStep1 from './components/register/RegisterStep1.tsx'
import RegisterStep2 from './components/register/RegisterStep2.tsx'
import RegisterStep3 from './components/register/RegisterStep3.tsx'
import ThankYouPage from './pages/ThankYouPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Navigate to="/register/step-1" replace />} />
        <Route path="/register/step-1" element={<RegisterStep1 />} />
        <Route path="/register/step-2" element={<RegisterStep2 />} />
        <Route path="/register/step-3" element={<RegisterStep3 />} />
        <Route path="/register/thank-you" element={<ThankYouPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
