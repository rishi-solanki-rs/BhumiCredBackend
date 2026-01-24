const fs = require('fs')
const path = require('path')

const p = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || path.resolve(__dirname, '..', 'credentials', 'credentials.json')
console.log('Inspecting credentials at', p)
try {
  const raw = fs.readFileSync(p, 'utf8')
  const cred = JSON.parse(raw)
  console.log('client_email:', cred.client_email)
  console.log('private_key present:', typeof cred.private_key === 'string')
  if (cred.private_key) {
    console.log('private_key length:', cred.private_key.length)
    console.log('private_key startsWith -----BEGIN:', cred.private_key.trim().startsWith('-----BEGIN'))
  }
} catch (err) {
  console.error('Failed to read/parse credentials', err.message)
}
