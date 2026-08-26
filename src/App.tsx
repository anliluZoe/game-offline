import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import CheckersPage from './pages/CheckersPage.tsx'
import GomokuPage from './pages/GomokuPage.tsx'
import HomePage from './pages/HomePage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gomoku" element={<GomokuPage />} />
        <Route path="/checkers" element={<CheckersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
