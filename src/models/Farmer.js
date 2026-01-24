const mongoose = require('mongoose')

const AddressSchema = new mongoose.Schema({
  village: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  pinCode: { type: String }
}, { _id: false })

const LandSchema = new mongoose.Schema({
  areaValue: { type: Number },
  unit: { type: String, enum: ['Hectare', 'Bigha', 'Acre'] }
}, { _id: false })

const FarmerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, unique: true, index: true },
  address: { type: AddressSchema, default: {} },
  land: { type: LandSchema, default: {} },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

module.exports = mongoose.model('Farmer', FarmerSchema)
