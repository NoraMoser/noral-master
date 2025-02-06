import mongoose from 'mongoose'
const Schema = mongoose.Schema

/**
 * Session Schema
 */
const SessionSchema = new Schema({
  token: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  socketId: {
    type: String
  },
  userAgent: {
    type: String,
    trim: true
  },
  created: {
    type: Date,
    trim: true,
    default: Date.now
  },
  expires: {
    type: String,
    trim: true,
    default: ''
  },
  session: {
    type: String,
    trim: true,
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Session', SessionSchema)