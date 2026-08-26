require('dotenv/config')
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const cvRoutes = require('./routes/cv')
const app = express()
const offerRoutes = require('./routes/offers')
const applicationRoutes = require('./routes/applications')

app.use(cors())
app.use(express.json())
app.use('/cv', cvRoutes)
app.use('/offers', offerRoutes)
app.use('/applications', applicationRoutes)

app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'JobMatch AI API is running' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})