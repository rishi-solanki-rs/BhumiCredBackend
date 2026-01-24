const { appendFarmerRow } = require('./googleSheets')

async function run() {
  try {
    const sample = {
      firstName: 'Test',
      lastName: 'User',
      mobileNumber: '9876543210',
      village: 'TestVillage',
      city: 'TestCity',
      state: 'TestState',
      country: 'India',
      pinCode: '560001',
      landArea: '1.5',
      landUnit: 'acre'
    }

    console.log('Starting Google Sheets append test...')
    const res = await appendFarmerRow(sample)
    console.log('appendFarmerRow result:', res)
  } catch (err) {
    console.error('test_gs error:', err)
  }
}

run()
