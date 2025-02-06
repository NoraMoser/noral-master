import mongoose from 'mongoose'
const Schema = mongoose.Schema

const EmailSchema = new Schema({
  title: {
    type: String,
    enum: ['Info', 'Support']
  },
  from: {
    type: String,
    trim: true,
    default: null
  },
  smtpConfig: {
    type: Object,
    default: {
      host: null,
      port: null,
      secure: true,
      auth: {
        user: null,
        pass: null
      }
    }
  },
  updated: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

mongoose.model('Email', EmailSchema)
