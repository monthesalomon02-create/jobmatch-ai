const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' })

async function callWithRetry(fn, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isRetryable = error.status === 503 || error.status === 429
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }
      console.log(`Tentative ${attempt} échouée (${error.status}), nouvel essai dans ${delayMs}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

const SYSTEM_PROMPT = `Tu es un assistant spécialisé en recrutement. Ta tâche est d'analyser une offre d'emploi et d'en extraire les informations clés au format JSON strict.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "title": "titre du poste",
  "company": "nom de l'entreprise si mentionné, sinon null",
  "hardSkills": ["compétence technique 1", "compétence technique 2"],
  "softSkills": ["compétence humaine 1", "compétence humaine 2"],
  "experienceLevel": "junior | intermédiaire | senior | non précisé",
  "keywords": ["mot-clé important 1", "mot-clé important 2"]
}

Limite hardSkills et keywords à 10 éléments maximum chacun, softSkills à 5 maximum.`

async function extractKeywords(jobOfferText) {
  const result = await callWithRetry(() =>
    model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nOffre d'emploi :\n${jobOfferText}` }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  )

  const rawContent = result.response.text()
  return JSON.parse(rawContent)
}

const LETTER_SYSTEM_PROMPT = `Tu es un expert en rédaction de lettres de motivation en français. Tu reçois le texte d'un CV et les informations extraites d'une offre d'emploi. Ta tâche :

1. Rédiger une lettre de motivation personnalisée, professionnelle, en français, de 250 à 350 mots, qui met en avant les expériences et compétences du CV qui correspondent le mieux à l'offre.
2. Calculer un score de correspondance (matchScore) entre 0 et 100, basé sur le recouvrement réel entre les compétences du CV et celles demandées par l'offre.

Réponds UNIQUEMENT avec un objet JSON strict, sans texte avant ou après, avec cette structure exacte :
{
  "letter": "texte complet de la lettre de motivation",
  "matchScore": nombre entre 0 et 100,
  "matchExplanation": "une phrase expliquant brièvement le score"
}

Ne mens jamais sur les compétences du candidat : ne mentionne dans la lettre que ce qui apparaît réellement dans le CV fourni.

N'utilise JAMAIS le tiret cadratin (—) dans le texte. Utilise à la place une virgule, un point, des deux-points, ou reformule la phrase selon ce qui convient le mieux au contexte.`

async function generateApplication(cvText, offerText, extractedKeywords) {
  const userContent = `${LETTER_SYSTEM_PROMPT}

CV du candidat :
${cvText}

---

Offre d'emploi :
${offerText}

---

Compétences clés extraites de l'offre : ${JSON.stringify(extractedKeywords)}`

  const result = await callWithRetry(() =>
    model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  )

  const rawContent = result.response.text()
  return JSON.parse(rawContent)
}

module.exports = { extractKeywords, generateApplication }