const ExcelJS = require('exceljs')
const fs = require('fs')
const path = require('path')

const FILE_DIR = path.resolve(__dirname, '..', '..', 'data')
const FILE_PATH = path.join(FILE_DIR, 'farmers_enrollment.xlsx')

async function appendFarmerRow(farmer) {
  if (!fs.existsSync(FILE_DIR)) fs.mkdirSync(FILE_DIR, { recursive: true })

  const workbook = new ExcelJS.Workbook()
  let worksheet

  if (fs.existsSync(FILE_PATH)) {
    await workbook.xlsx.readFile(FILE_PATH)
    worksheet = workbook.getWorksheet('farmers') || workbook.addWorksheet('farmers')
  } else {
    worksheet = workbook.addWorksheet('farmers')
    worksheet.addRow(['First Name','Last Name','Mobile Number','Village','City','State','Country','Pin Code','Land Area','Land Unit','Submission Date'])
  }

  const row = [
    farmer.firstName || '',
    farmer.lastName || '',
    farmer.mobileNumber || farmer.mobile || '',
    farmer.village || (farmer.address && farmer.address.village) || '',
    farmer.city || (farmer.address && farmer.address.city) || '',
    farmer.state || (farmer.address && farmer.address.state) || '',
    farmer.country || (farmer.address && farmer.address.country) || 'India',
    farmer.pinCode || (farmer.address && farmer.address.pinCode) || '',
    farmer.landArea || (farmer.land && farmer.land.areaValue) || '',
    farmer.landUnit || (farmer.land && farmer.land.unit) || '',
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  ]

  worksheet.addRow(row)
  await workbook.xlsx.writeFile(FILE_PATH)
}

module.exports = { appendFarmerRow }
