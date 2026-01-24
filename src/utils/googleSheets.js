const { google } = require('googleapis')

const DEFAULT_SPREADSHEET_ID = '1_c7krfVkyVk5MplvRNffNUXhOXWgQq-UDHvJATSz8QQ'
const SHEET_NAME = 'farmers'

/**
 * Load Google Service Account credentials from environment variable
 * Expects GOOGLE_SERVICE_ACCOUNT_B64 to be a base64-encoded JSON string
 */
function loadCredentials() {
  // Load from base64 environment variable (recommended for deployment)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_B64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8')
      const cred = JSON.parse(decoded)
      
      // Normalize private_key: replace escaped newlines
      if (cred.private_key && typeof cred.private_key === 'string') {
        cred.private_key = cred.private_key.replace(/\\n/g, '\n')
      }
      
      console.log('GoogleSheets: Loaded credentials from GOOGLE_SERVICE_ACCOUNT_B64')
      console.log('GoogleSheets: Service account email:', cred.client_email)
      return cred
    } catch (err) {
      console.error('GoogleSheets: Failed to parse GOOGLE_SERVICE_ACCOUNT_B64:', err.message)
      return null
    }
  }
  
  console.warn('GoogleSheets: No credentials found. Set GOOGLE_SERVICE_ACCOUNT_B64 environment variable.')
  return null
}

/**
 * Append a farmer record to Google Sheets
 */
async function appendFarmerRow(farmer) {
  const creds = loadCredentials()
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID

  if (!creds) {
    console.warn('GoogleSheets: Credentials not configured, skipping append')
    return null
  }

  // Validate required fields
  if (!creds.client_email || !creds.private_key) {
    console.warn('GoogleSheets: Invalid credentials - missing client_email or private_key')
    return null
  }

  // Authenticate with Google
  let authClient
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    authClient = await auth.getClient()
    console.log('GoogleSheets: Authentication successful')
  } catch (err) {
    console.warn('GoogleSheets: Authentication failed:', err.message)
    return null
  }

  const sheets = google.sheets({ version: 'v4', auth: authClient })
  console.log('GoogleSheets: Using spreadsheet:', spreadsheetId, 'sheet:', SHEET_NAME)

  // Ensure sheet exists and has headers
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    const sheetsList = (meta.data.sheets || []).map(s => ({ 
      id: s.properties.sheetId, 
      title: s.properties.title 
    }))
    
    let sheetExists = sheetsList.find(s => s.title === SHEET_NAME)
    
    // Create sheet if it doesn't exist
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_NAME } } }]
        }
      })
      console.log('GoogleSheets: Created new sheet:', SHEET_NAME)
    }

    // Ensure header row exists
    const headerRange = `${SHEET_NAME}!A1:K1`
    const expectedHeaders = [
      'First Name', 'Last Name', 'Mobile Number', 'Village', 'City', 
      'State', 'Country', 'Pin Code', 'Land Area', 'Land Unit', 'Submission Date'
    ]

    const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange })
    const headerValues = (headerRes.data.values || [])[0] || []
    const needHeader = expectedHeaders.some((h, i) => headerValues[i] !== h)
    
    if (needHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [expectedHeaders] }
      })
      console.log('GoogleSheets: Headers updated')
    }
  } catch (err) {
    console.warn('GoogleSheets: Could not verify sheet/headers:', err.message)
  }

  // Prepare farmer data row
  const village = farmer.village || (farmer.address && farmer.address.village) || ''
  const city = farmer.city || (farmer.address && farmer.address.city) || ''
  const state = farmer.state || (farmer.address && farmer.address.state) || ''
  const country = farmer.country || (farmer.address && farmer.address.country) || 'India'
  const pinCode = farmer.pinCode || (farmer.address && farmer.address.pinCode) || ''
  const landArea = farmer.landArea || (farmer.land && farmer.land.areaValue) || ''
  const landUnit = farmer.landUnit || (farmer.land && farmer.land.unit) || ''

  const values = [[
    farmer.firstName || '',
    farmer.lastName || '',
    farmer.mobileNumber || farmer.mobile || '',
    village,
    city,
    state,
    country,
    pinCode,
    landArea,
    landUnit,
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  ]]

  // Append data to sheet
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: SHEET_NAME,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    })
    
    console.log('GoogleSheets: Data appended successfully')
    return res.data
  } catch (err) {
    console.warn('GoogleSheets: Failed to append data:', err.message)
    return null
  }
}

module.exports = { appendFarmerRow }