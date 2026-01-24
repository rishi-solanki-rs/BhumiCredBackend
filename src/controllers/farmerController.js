const Farmer = require('../models/Farmer')
const { appendFarmerRow } = require('../utils/excel')
const { appendFarmerRow: appendFarmerRowToSheets } = require('../utils/googleSheets')

// Validation helpers
function isValidMobile(mobile) {
  return typeof mobile === 'string' && /^[0-9]{10}$/.test(mobile)
}

function isValidPinCode(pin) {
  return typeof pin === 'string' && /^[0-9]{6}$/.test(pin)
}

function isValidLandArea(area) {
  const num = Number(area)
  return !isNaN(num) && num > 0
}

function isValidLandUnit(unit) {
  return ['Hectare', 'Bigha', 'Acre'].includes(unit)
}

async function enroll(req, res) {
  try {
    const { firstName, lastName, mobileNumber, mobile, village, city, state, country, pinCode, landArea, landUnit, address = {}, land = {} } = req.body

    // Support both flat and nested structures
    const actualMobile = mobileNumber || mobile
    const actualVillage = village || address.village
    const actualCity = city || address.city
    const actualState = state || address.state
    const actualCountry = country || address.country || 'India'
    const actualPinCode = pinCode || address.pinCode
    const actualLandArea = landArea || land.areaValue
    const actualLandUnit = landUnit || land.unit

    // Required field validation
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and last name are required' })
    }
    
    if (!actualMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' })
    }
    
    if (!isValidMobile(String(actualMobile))) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits' })
    }
    
    if (actualPinCode && !isValidPinCode(String(actualPinCode))) {
      return res.status(400).json({ success: false, message: 'Pin code must be exactly 6 digits' })
    }
    
    if (actualLandArea && !isValidLandArea(actualLandArea)) {
      return res.status(400).json({ success: false, message: 'Land area must be a positive number' })
    }
    
    if (actualLandUnit && !isValidLandUnit(actualLandUnit)) {
      return res.status(400).json({ success: false, message: 'Land unit must be one of: Hectare, Bigha, Acre' })
    }

    // Check for duplicate mobile
    const existing = await Farmer.findOne({ mobile: String(actualMobile) })
    if (existing) {
      return res.status(409).json({ success: false, message: 'A farmer with this mobile number already exists' })
    }

    // Save to MongoDB
    const doc = new Farmer({ 
      firstName, 
      lastName, 
      mobile: String(actualMobile), 
      address: {
        village: actualVillage,
        city: actualCity,
        state: actualState,
        country: actualCountry,
        pinCode: actualPinCode
      }, 
      land: {
        areaValue: actualLandArea,
        unit: actualLandUnit
      }
    })
    const saved = await doc.save()

    // Append to Excel in background (non-blocking, best-effort)
    const flatFarmer = {
      firstName,
      lastName,
      mobileNumber: actualMobile,
      village: actualVillage,
      city: actualCity,
      state: actualState,
      country: actualCountry,
      pinCode: actualPinCode,
      landArea: actualLandArea,
      landUnit: actualLandUnit
    }
    
    appendFarmerRow(flatFarmer)
      .then(() => {
        console.log('✓ Farmer data appended to Excel')
      })
      .catch(err => {
        console.error('✗ Excel append failed:', err.message)
      })

    // Also try to append to Google Sheets (non-blocking)
    appendFarmerRowToSheets(flatFarmer)
      .then(() => console.log('✓ Farmer data appended to Google Sheets'))
      .catch(err => console.error('✗ Google Sheets append failed:', err && err.message ? err.message : err))

    return res.status(201).json({ success: true, farmer: saved })
  } catch (err) {
    console.error('Enrollment error:', err)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

module.exports = { enroll }
