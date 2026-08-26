const prisma = require('../config/prisma')
const { extractKeywords } = require('../services/mistralService')

async function createOffer(req, res) {
  try {
    const { title, company, rawText } = req.body

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ error: 'Le texte de l\'offre est trop court ou manquant' })
    }

    const extractedKeywords = await extractKeywords(rawText)

    const offer = await prisma.jobOffer.create({
      data: {
        userId: req.userId,
        title: title || extractedKeywords.title || 'Titre non précisé',
        company: company || extractedKeywords.company || null,
        rawText,
        extractedKeywords
      }
    })

    res.status(201).json({ offer })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de l\'analyse de l\'offre' })
  }
}

async function getUserOffers(req, res) {
  try {
    const offers = await prisma.jobOffer.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ offers })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

module.exports = { createOffer, getUserOffers }