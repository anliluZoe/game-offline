import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import GomokuPage from './pages/GomokuPage.tsx'
import HomePage from './pages/HomePage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gomoku" element={<GomokuPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
