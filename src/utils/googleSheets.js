// const { google } = require('googleapis')
// const fs = require('fs')
// const path = require('path')

// const DEFAULT_SPREADSHEET_ID = '1_c7krfVkyVk5MplvRNffNUXhOXWgQq-UDHvJATSz8QQ'
// const SHEET_NAME = 'farmers'

// function loadCredentials() {
//   // Priority: env JSON string -> env path -> default undefined
//   if (process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) {
//     // Accept three forms:
//     // 1) raw JSON string
//     // 2) base64-encoded JSON
//     // 3) a filepath to a JSON file
//     const raw = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
//     // try raw JSON
//     try {
//       const cred = JSON.parse(raw)
//       if (cred.private_key && typeof cred.private_key === 'string') {
//         cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//       }
//       console.log('GoogleSheets: using credentials from GOOGLE_SHEETS_CREDENTIALS_JSON (raw JSON)')
//       return cred
//     } catch (errRaw) {
//       // try base64
//       try {
//         const decoded = Buffer.from(raw, 'base64').toString('utf8')
//         const cred = JSON.parse(decoded)
//         if (cred.private_key && typeof cred.private_key === 'string') {
//           cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//         }
//         console.log('GoogleSheets: using credentials from GOOGLE_SHEETS_CREDENTIALS_JSON (base64)')
//         return cred
//       } catch (errB64) {
//         // try as a file path
//         try {
//           const resolved = path.resolve(raw)
//           if (fs.existsSync(resolved)) {
//             const rawf = fs.readFileSync(resolved, 'utf8')
//             const cred = JSON.parse(rawf)
//             if (cred.private_key && typeof cred.private_key === 'string') {
//               cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//             }
//             console.log('GoogleSheets: using credentials from GOOGLE_SHEETS_CREDENTIALS_JSON (file path) ->', resolved)
//             return cred
//           }
//         } catch (errFile) {
//           // fallthrough to error below
//         }
//       }
//     }
//     console.error('Failed to parse GOOGLE_SHEETS_CREDENTIALS_JSON: not valid JSON/base64/filepath')
//     return null
//   }

//   // Accept base64-only env var (alternative)
//   if (process.env.GOOGLE_SHEETS_CREDENTIALS_B64) {
//     try {
//       const decoded = Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS_B64, 'base64').toString('utf8')
//       const cred = JSON.parse(decoded)
//       if (cred.private_key && typeof cred.private_key === 'string') {
//         cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//       }
//       console.log('GoogleSheets: using credentials from GOOGLE_SHEETS_CREDENTIALS_B64')
//       return cred
//     } catch (err) {
//       console.error('Failed to parse GOOGLE_SHEETS_CREDENTIALS_B64', err && err.message ? err.message : err)
//       return null
//     }
//   }

//   if (process.env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
//     try {
//       const resolved = path.resolve(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH)
//       if (!fs.existsSync(resolved)) {
//         console.warn('GoogleSheets: GOOGLE_SHEETS_CREDENTIALS_PATH set but file not found at', resolved)
//         return null
//       }
//       const raw = fs.readFileSync(resolved, 'utf8')
//       const cred = JSON.parse(raw)
//       if (cred.private_key && typeof cred.private_key === 'string') {
//         cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//       }
//       console.log('GoogleSheets: using credentials from GOOGLE_SHEETS_CREDENTIALS_PATH ->', resolved)
//       return cred
//     } catch (err) {
//       console.error('Failed to read GOOGLE_SHEETS_CREDENTIALS_PATH', err && err.message ? err.message : err)
//       return null
//     }
//   }

//   // If no env provided, look for a credentials file in backend/src/credentials/
//   try {
//     const defaultCredPath = path.resolve(__dirname, '..', 'credentials', 'google-service-account.json')
//     if (fs.existsSync(defaultCredPath)) {
//       const raw = fs.readFileSync(defaultCredPath, 'utf8')
//       const cred = JSON.parse(raw)
//       if (cred.private_key && typeof cred.private_key === 'string') {
//         cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//       }
//       console.log('GoogleSheets: using default credentials file ->', defaultCredPath)
//       return cred
//     }
//     // also accept an alternate name used by the team
//     const altPath = path.resolve(__dirname, '..', 'credentials', 'google-credentials.json')
//     if (fs.existsSync(altPath)) {
//       const raw = fs.readFileSync(altPath, 'utf8')
//       const cred = JSON.parse(raw)
//       if (cred.private_key && typeof cred.private_key === 'string') {
//         cred.private_key = cred.private_key.replace(/\\n/g, '\n')
//       }
//       console.log('GoogleSheets: using alternate default credentials file ->', altPath)
//       return cred
//     }
//   } catch (err) {
//     console.error('Failed to read default credentials file in backend/src/credentials', err)
//     // fall through to return null
//   }

//   return null
// }

// async function appendFarmerRow(farmer) {
//   const creds = loadCredentials()
//   const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID

//   if (!creds) {
//     console.warn('Google Sheets credentials not configured; skipping Sheets append. Set GOOGLE_SHEETS_CREDENTIALS_JSON or GOOGLE_SHEETS_CREDENTIALS_PATH')
//     return null
//   }

//   let jwtClient
//   try {
//     jwtClient = new google.auth.JWT(
//       creds.client_email,
//       null,
//       creds.private_key,
//       ['https://www.googleapis.com/auth/spreadsheets']
//     )

//     await jwtClient.authorize()
//   } catch (err) {
//     console.warn('Google Sheets: authorization failed; skipping Sheets append', err && err.message ? err.message : err)
//     return null
//   }

//   console.log('GoogleSheets: spreadsheetId=', spreadsheetId, 'sheetName=', SHEET_NAME)

//   const sheets = google.sheets({ version: 'v4', auth: jwtClient })

//   // Ensure the sheet/tab exists and headers are present
//   try {
//     const meta = await sheets.spreadsheets.get({ spreadsheetId })
//     const sheetsList = (meta.data.sheets || []).map(s => ({ id: s.properties.sheetId, title: s.properties.title }))
//     const found = sheetsList.find(s => s.title === SHEET_NAME)
//     if (!found) {
//       // create new sheet tab
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId,
//         requestBody: {
//           requests: [{ addSheet: { properties: { title: SHEET_NAME } } }]
//         }
//       })
//     }

//     // Ensure header row exists
//     const headerRange = `${SHEET_NAME}!A1:K1`
//     const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange })
//     const headerValues = (headerRes.data.values || [])[0] || []
//     const expectedHeaders = ['First Name','Last Name','Mobile Number','Village','City','State','Country','Pin Code','Land Area','Land Unit','Submission Date']
//     const needHeader = expectedHeaders.some((h, i) => headerValues[i] !== h)
//     if (needHeader) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: headerRange,
//         valueInputOption: 'USER_ENTERED',
//         requestBody: { values: [expectedHeaders] }
//       })
//     }
//   } catch (err) {
//     // Non-fatal: log and continue to append; append may still work if tab exists
//     console.warn('Google Sheets: could not ensure sheet/headers', err && err.message ? err.message : err)
//   }

//   // Prepare row values in the exact order required
//   const values = [[
//     farmer.firstName || '',
//     farmer.lastName || '',
//     farmer.mobileNumber || farmer.mobile || '',
//     farmer.village || '',
//     farmer.city || '',
//     farmer.state || '',
//     farmer.country || 'India',
//     farmer.pinCode || '',
//     farmer.landArea || '',
//     farmer.landUnit || '',
//     new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
//   ]]

//   // Append values to the sheet; if sheet/tab doesn't exist, API will still append to the range (it must exist).
//   // We use range `${SHEET_NAME}!A1:K1` and append.
//   try {
//     const res = await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: `${SHEET_NAME}!A1:K1`,
//       valueInputOption: 'USER_ENTERED',
//       insertDataOption: 'INSERT_ROWS',
//       requestBody: { values }
//     })

//     try {
//       console.log('GoogleSheets: append response:', JSON.stringify(res.data).slice(0, 1000))
//     } catch (e) {
//       console.log('GoogleSheets: append succeeded')
//     }

//     return res.data
//   } catch (err) {
//     console.warn('Google Sheets: append failed', err && err.message ? err.message : err)
//     return null
//   }
// }

// module.exports = { appendFarmerRow }
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const DEFAULT_SPREADSHEET_ID = '1_c7krfVkyVk5MplvRNffNUXhOXWgQq-UDHvJATSz8QQ';
const SHEET_NAME = 'farmers';

// --------- LOAD CREDENTIALS ----------
function loadCredentials() {
  let cred = null;

  if (process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) {
    try {
      const raw = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON;
      const parsed = raw.trim().startsWith('{')
        ? JSON.parse(raw)
        : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));

      // normalize private_key: replace escaped newlines and strip CRs
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n').replace(/\r/g, '')
      }

      console.log('GoogleSheets: using credentials from ENV')
      console.log('GoogleSheets: client_email=', parsed.client_email)
      console.log('GoogleSheets: private_key present=', !!parsed.private_key, 'len=', parsed.private_key ? parsed.private_key.length : 0)
      return parsed;
    } catch (e) {
      console.error('Invalid GOOGLE_SHEETS_CREDENTIALS_JSON', e.message);
      return null;
    }
  }

  if (process.env.GOOGLE_SHEETS_CREDENTIALS_PATH) {
    try {
      const resolved = path.resolve(process.env.GOOGLE_SHEETS_CREDENTIALS_PATH);
      if (!fs.existsSync(resolved)) {
        console.error('Credentials file not found at', resolved);
        return null;
      }
      cred = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      // normalize private_key: replace escaped newlines and strip CRs
      if (cred.private_key && typeof cred.private_key === 'string') {
        cred.private_key = cred.private_key.replace(/\\n/g, '\n').replace(/\r/g, '')
      }
      console.log('GoogleSheets: using credentials from file ->', resolved);
      console.log('GoogleSheets: client_email=', cred.client_email)
      console.log('GoogleSheets: private_key present=', !!cred.private_key, 'len=', cred.private_key ? cred.private_key.length : 0)
      return cred;
    } catch (e) {
      console.error('Failed to read credentials file', e.message);
      return null;
    }
  }

  console.warn('No Google Sheets credentials found!');
  return null;
}

// --------- APPEND FARMER ROW ----------
async function appendFarmerRow(farmer) {
  const creds = loadCredentials();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;

  if (!creds) {
    console.warn('Google Sheets credentials not configured; skipping Sheets append.');
    return null;
  }

  // --- AUTHENTICATE ---
 // --- AUTHENTICATE ---
let jwtClient;
  // Validate credentials before attempting auth
  if (!creds.client_email || !creds.private_key) {
    console.warn('Google Sheets: missing client_email or private_key in credentials; skipping Sheets append')
    return null
  }

  // Use GoogleAuth with in-memory credentials (more robust across googleapis versions)
  let authClient
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    })
    authClient = await auth.getClient()
    console.log('Google Sheets: authorization succeeded (GoogleAuth)')
  } catch (err) {
    console.warn('Google Sheets: authorization failed; skipping Sheets append', err && err.message ? err.message : err)
    return null
  }

  console.log('GoogleSheets: spreadsheetId=', spreadsheetId, 'sheetName=', SHEET_NAME);
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  // --- ENSURE SHEET AND HEADER ---
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = (meta.data.sheets || []).map(s => ({ id: s.properties.sheetId, title: s.properties.title }));
    let sheetExists = sheetsList.find(s => s.title === SHEET_NAME);
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
        },
      });
      sheetExists = true;
    }

    const headerRange = `${SHEET_NAME}!A1:K1`;
    const expectedHeaders = [
      'First Name','Last Name','Mobile Number','Village','City','State','Country',
      'Pin Code','Land Area','Land Unit','Submission Date'
    ];

    const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
    const headerValues = (headerRes.data.values || [])[0] || [];
    const needHeader = expectedHeaders.some((h, i) => headerValues[i] !== h);
    if (needHeader) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [expectedHeaders] },
      });
    }
  } catch (err) {
    console.warn('Google Sheets: could not ensure sheet/headers', err.message);
  }

  // --- APPEND FARMER DATA ---
  // normalize address/land fields: prefer flat fields, then nested
  const village = farmer.village || (farmer.address && farmer.address.village) || ''
  const city = farmer.city || (farmer.address && farmer.address.city) || ''
  const state = farmer.state || (farmer.address && farmer.address.state) || ''
  const country = farmer.country || (farmer.address && farmer.address.country) || ''
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
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  ]];

  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: SHEET_NAME, // append to sheet
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
    console.log('GoogleSheets: append succeeded');
    return res.data;
  } catch (err) {
    console.warn('Google Sheets: append failed', err.message);
    return null;
  }
}

module.exports = { appendFarmerRow };