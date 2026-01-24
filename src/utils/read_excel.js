const ExcelJS = require('exceljs')
const path = require('path')
const FILE_PATH = path.resolve(__dirname, '..', '..', 'data', 'farmers_enrollment.xlsx')

;(async () => {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(FILE_PATH)
    const worksheet = workbook.getWorksheet('farmers')
    if (!worksheet) return console.log('No worksheet named farmers')
    const rows = []
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      rows.push({ rowNumber, values: row.values })
    })
    console.log('Found rows:', rows.length)
    for (let r of rows.slice(-10)) console.log(r.rowNumber, r.values)
  } catch (err) {
    console.error('read_excel error:', err.message)
  }
})()
