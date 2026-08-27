import { useState, useEffect } from 'react'
import api from '../api/client'

export default function UploadCV() {
  const [file, setFile] = useState(null)
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadCvs() {
    try {
      const res = await api.get('/cv')
      setCvs(res.data.cvs)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadCvs()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData()
    formData.append('cv', file)

    try {
      await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('CV ajouté avec succès.')
      setFile(null)
      loadCvs()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Vos CV</h1>
      <p className="page-subtitle">Ajoutez un CV pour pouvoir générer des candidatures ciblées.</p>

      <form className="upload-card" onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Analyse en cours...' : 'Ajouter ce CV'}
        </button>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
      </form>

      <div className="list">
        {cvs.length === 0 && <p className="empty-state">Aucun CV pour l'instant.</p>}
        {cvs.map((cv) => (
          <div key={cv.id} className="list-item">
            <span className="list-item__name">{cv.filename}</span>
            <span className="list-item__date">{new Date(cv.uploadedAt).toLocaleDateString('fr-FR')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}