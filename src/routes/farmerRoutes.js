const express = require('express')
const router = express.Router()
const { enroll } = require('../controllers/farmerController')

router.post('/enroll', enroll)

module.exports = router
