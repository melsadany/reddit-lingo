const express = require('express')
const assessmentsAPIRoutes = require('./assessments.route.js')

const router = express.Router() // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
)

router.use('/assessmentsAPI', assessmentsAPIRoutes)

module.exports = router
