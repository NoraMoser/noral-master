import mongoose from 'mongoose'
const Schema = mongoose.Schema

/**
 * Enterprise Schema
 */
var EnterpriseSchema = new Schema({
  companyName: {
    type: String,
    trim: true,
    label: 'Company name',
    unique: 'Company name already exists',
    required: 'Please enter an company name'
  },
  application: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  logo: {
    type: Schema.ObjectId,
    ref: 'File',
    label: 'Logo',
    inputType: 'file',
    defaultImage: 'enterprise',
    accept: ['.jpg, .jpeg, .png']
  },
  icon: {
    type: Schema.ObjectId,
    ref: 'File',
    label: 'Icon',
    inputType: 'file',
    defaultImage: 'enterprise',
    accept: ['.jpg, .jpeg, .png']
  },
  token: {
    type: String,
    trim: true
  },
  EIN: {
    type: String,
    trim: true,
    label: 'EIN'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastUpdatedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  form: {
    type: Object,
    enterpriseEdit: [
      { input: 'logo', roles: ['admin', 'superadmin'] },
      { input: 'icon', roles: ['admin', 'superadmin'] },
      { input: 'companyName', roles: ['admin', 'superadmin'] },
      { input: 'EIN', roles: ['admin', 'superadmin'] }
    ]
  }
})

mongoose.model('Enterprise', EnterpriseSchema)
