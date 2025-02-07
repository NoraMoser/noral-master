import mongoose from 'mongoose'

const FileSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assuming it relates to a user
})

export default mongoose.model('File', FileSchema)
