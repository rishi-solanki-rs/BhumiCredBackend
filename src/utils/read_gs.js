const { google } = require('googleapis')
const fs = require('fs')
const path = require('path')

function loadCredentials() {
  if (process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) {
    try { return JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) } catch(e) {}
    try { return JSON.parse(Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS_JSON, 'base64').toString('utf8')) } catch(e) {}
  }
  if (process.env.GOOGLE_SHEETS_CREDENTIALS_B64) {
    try { return JSON.parse(Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS_B64, 'base64').toString('utf8')) } catch(e) {}
  }
  if (process.env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
    const p = path.resolve(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH)
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8'))
  }
  const def = path.resolve(__dirname, '..', 'credentials', 'google-service-account.json')
  if (fs.existsSync(def)) return JSON.parse(fs.readFileSync(def,'utf8'))
  throw new Error('No credentials')
}

async function readSheet() {
  const creds = loadCredentials()
  const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] })
  const client = await auth.getClient()
  const sheets = google.sheets({version:'v4', auth: client})
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1_c7krfVkyVk5MplvRNffNUXhOXWgQq-UDHvJATSz8QQ'
  const range = 'farmers!A1:K100'
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  const rows = res.data.values || []
  console.log('Spreadsheet ID:', spreadsheetId)
  console.log('Rows fetched:', rows.length)
  rows.slice(0,5).forEach((r,i)=>console.log('H',i+1,r))
  console.log('--- last rows ---')
  rows.slice(-10).forEach((r,i)=>console.log('L',rows.length-10+i+1,r))
}

readSheet().catch(e=>{ console.error('read_gs error:', e && e.message ? e.message : e) })
