const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { createApplication, getUserApplications } = require('../controllers/applicationController')

router.post('/', authMiddleware, createApplication)
router.get('/', authMiddleware, getUserApplications)

module.exports = router