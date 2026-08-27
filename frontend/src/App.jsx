import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import UploadCV from './pages/UploadCV'
import NewOffer from './pages/NewOffer'
import ApplicationResult from './pages/ApplicationResult'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload-cv" element={<ProtectedRoute><UploadCV /></ProtectedRoute>} />
          <Route path="/new-offer" element={<ProtectedRoute><NewOffer /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><ApplicationResult /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}