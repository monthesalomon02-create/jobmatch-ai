const express = require('express')
const router = express.Router()
const upload = require('../config/multer')
const authMiddleware = require('../middlewares/authMiddleware')
const { uploadCV, getUserCVs } = require('../controllers/cvController')

router.post('/upload', (req, res, next) => {
  console.log('1. Requête reçue')
  next()
}, authMiddleware, (req, res, next) => {
  console.log('2. Auth passée, userId:', req.userId)
  next()
}, upload.single('cv'), (req, res, next) => {
  console.log('3. Multer terminé, fichier:', req.file)
  next()
}, uploadCV)

router.get('/', authMiddleware, getUserCVs)

module.exports = router