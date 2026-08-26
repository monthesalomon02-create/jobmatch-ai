const { Mistral } = require('@mistralai/mistralai')

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

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
  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: jobOfferText }
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.2
  })

  const rawContent = response.choices[0].message.content
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

Ne mens jamais sur les compétences du candidat : ne mentionne dans la lettre que ce qui apparaît réellement dans le CV fourni.`

async function generateApplication(cvText, offerText, extractedKeywords) {
  const userContent = `CV du candidat :
${cvText}

---

Offre d'emploi :
${offerText}

---

Compétences clés extraites de l'offre : ${JSON.stringify(extractedKeywords)}`

  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [
      { role: 'system', content: LETTER_SYSTEM_PROMPT },
      { role: 'user', content: userContent }
    ],
    responseFormat: { type: 'json_object' },
    temperature: 0.4
  })

  const rawContent = response.choices[0].message.content
  return JSON.parse(rawContent)
}

module.exports = { extractKeywords, generateApplication }