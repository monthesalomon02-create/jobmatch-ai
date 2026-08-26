const fs = require('fs')
const pdfParse = require('pdf-parse')
const prisma = require('../config/prisma')

async function uploadCV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' })
    }

    const filePath = req.file.path
    const dataBuffer = fs.readFileSync(filePath)
    const pdfData = await pdfParse(dataBuffer)

    if (!pdfData.text || pdfData.text.trim().length < 20) {
      fs.unlinkSync(filePath) // nettoie le fichier si le parsing échoue
      return res.status(422).json({ error: 'Impossible d\'extraire le texte du PDF' })
    }

    const cv = await prisma.cV.create({
      data: {
        userId: req.userId,
        filename: req.file.originalname,
        extractedText: pdfData.text
      },
      select: {
        id: true,
        filename: true,
        uploadedAt: true
      }
    })

    fs.unlinkSync(filePath) // on garde le texte en base, pas besoin du fichier brut

    res.status(201).json({ cv })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors du traitement du CV' })
  }
}

async function getUserCVs(req, res) {
  try {
    const cvs = await prisma.cV.findMany({
      where: { userId: req.userId },
      select: { id: true, filename: true, uploadedAt: true },
      orderBy: { uploadedAt: 'desc' }
    })
    res.json({ cvs })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

module.exports = { uploadCV, getUserCVs }