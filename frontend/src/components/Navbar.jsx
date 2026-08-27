import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">JobMatch<span>AI</span></Link>
      {token && (
        <div className="navbar__links">
          <Link to="/upload-cv">Mes CV</Link>
          <Link to="/new-offer">Nouvelle offre</Link>
          <button onClick={handleLogout} className="navbar__logout">Déconnexion</button>
        </div>
      )}
    </nav>
  )
}