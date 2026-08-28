import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function NewOffer() {
  const [rawText, setRawText] = useState('')
  const [cvs, setCvs] = useState([])
  const [selectedCvId, setSelectedCvId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/cv').then((res) => {
      setCvs(res.data.cvs)
      if (res.data.cvs.length > 0) setSelectedCvId(res.data.cvs[0].id)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCvId) {
      setError('Ajoutez d\'abord un CV avant de traiter une offre.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const offerRes = await api.post('/offers', { rawText })
      const offerId = offerRes.data.offer.id

      const appRes = await api.post('/applications', { cvId: selectedCvId, offerId })
      navigate('/result', { state: { application: appRes.data.application, offer: offerRes.data.offer } })
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Analyser une offre</h1>
      <p className="page-subtitle">Collez le texte d'une offre d'emploi. L'IA génère votre lettre et votre score de correspondance.</p>

      <form className="offer-form" onSubmit={handleSubmit}>
        <label>CV à utiliser
          <select value={selectedCvId} onChange={(e) => setSelectedCvId(e.target.value)}>
            {cvs.length === 0 && <option value="">Aucun CV disponible</option>}
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>{cv.filename}</option>
            ))}
          </select>
        </label>

        <label>Texte de l'offre
          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Collez ici le texte complet de l'offre d'emploi..."
            required
          />
        </label>

        {error && <p className="form-error">{error}</p>}

       <div>
  <button type="submit" disabled={loading}>
    {loading ? <span className="loading-text">Génération en cours...</span> : 'Générer ma candidature'}
  </button>
  {loading && (
    <div className="progress-track">
      <div className="progress-fill" />
    </div>
  )}
</div>
      </form>
    </div>
  )
}