const prisma = require('../config/prisma')
const { generateApplication } = require('../services/mistralService')

async function createApplication(req, res) {
  try {
    const { cvId, offerId } = req.body

    if (!cvId || !offerId) {
      return res.status(400).json({ error: 'cvId et offerId requis' })
    }

    const cv = await prisma.cV.findFirst({
      where: { id: cvId, userId: req.userId }
    })
    if (!cv) {
      return res.status(404).json({ error: 'CV introuvable' })
    }

    const offer = await prisma.jobOffer.findFirst({
      where: { id: offerId, userId: req.userId }
    })
    if (!offer) {
      return res.status(404).json({ error: 'Offre introuvable' })
    }

    const result = await generateApplication(
      cv.extractedText,
      offer.rawText,
      offer.extractedKeywords
    )

    result.letter = result.letter.replace(/—/g, ',').replace(/,\s*,/g, ',')

    const application = await prisma.application.create({
      data: {
        userId: req.userId,
        cvId: cv.id,
        offerId: offer.id,
        generatedLetter: result.letter,
        matchScore: result.matchScore,
        status: 'draft'
      }
    })

    res.status(201).json({
      application,
      matchExplanation: result.matchExplanation
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la génération de la candidature' })
  }
}

async function getUserApplications(req, res) {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ applications })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

module.exports = { createApplication, getUserApplications }