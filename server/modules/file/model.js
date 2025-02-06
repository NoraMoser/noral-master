import mongoose from 'mongoose'
const Schema = mongoose.Schema
const validFileTypes = ['image/*', 'audio/*', 'application/*', 'video/*']

const validateFileType = function(file) {
  return !this.update ? validFileTypes.includes(file.type): true
}

/**
 * File Schema
 */
const FileSchema = new Schema({
  data: {
    type: Schema.ObjectId,
    ref: 'fs.file'
  },
  type: {
    type: String,
    validate: [validateFileType, `Invalid file type. Must be ${validFileTypes.toString()}`],
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  size: {
    type: Number
  },
  lastModified: {
    type: Number
  },
  lastModifiedDate: {
    type: Date
  },
  enterprise: {
    type: Schema.ObjectId,
    ref: 'Enterprise'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
})

mongoose.model('File', FileSchema)
