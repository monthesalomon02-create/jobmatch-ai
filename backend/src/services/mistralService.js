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
    temperature: 0.2 // peu de créativité, on veut de la précision
  })

  const rawContent = response.choices[0].message.content
  return JSON.parse(rawContent)
}

module.exports = { extractKeywords }