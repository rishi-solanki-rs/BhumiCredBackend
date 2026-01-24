# BhumiCred Backend

Local steps:

1. cd backend
2. npm install
3. copy .env.example to .env and set MONGO_URI
4. npm run dev

API

POST /api/farmers/enroll
- Accepts JSON body with `firstName`, `lastName`, `mobile`, `address` (village, city, state, country, pinCode), `land` (areaValue, unit)
- On success: 201 and saved farmer
- On duplicate mobile: 409

Excel export

- Submissions are appended to `backend/data/farmers.xlsx`
