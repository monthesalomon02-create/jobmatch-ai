const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { createOffer, getUserOffers } = require('../controllers/offerController')

router.post('/', authMiddleware, createOffer)
router.get('/', authMiddleware, getUserOffers)

module.exports = router