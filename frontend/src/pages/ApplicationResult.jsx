import { useLocation, Link } from 'react-router-dom'

export default function ApplicationResult() {
  const { state } = useLocation()

  if (!state?.application) {
    return (
      <div className="page">
        <p className="empty-state">Aucun résultat à afficher.</p>
        <Link to="/new-offer">Analyser une offre</Link>
      </div>
    )
  }

  const { application, offer } = state
  const score = application.matchScore
  const scoreClass = score >= 60 ? 'score--high' : score >= 35 ? 'score--mid' : 'score--low'

  return (
    <div className="page">
      <div className="result-header">
        <div>
          <h1>{offer.title}</h1>
          {offer.company && <p className="page-subtitle">{offer.company}</p>}
        </div>
        <div className={`score-badge ${scoreClass}`}>
          <span className="score-badge__value">{score}</span>
          <span className="score-badge__label">/ 100</span>
        </div>
      </div>

      <div className="skills-overlap">
        {offer.extractedKeywords?.hardSkills?.map((skill) => (
          <span key={skill} className="skill-pill">{skill}</span>
        ))}
      </div>

      <div className="letter-card">
        <h2>Lettre de motivation générée</h2>
        <p className="letter-text">{application.generatedLetter}</p>
      </div>

      <Link to="/new-offer" className="btn-secondary">Analyser une autre offre</Link>
    </div>
  )
}