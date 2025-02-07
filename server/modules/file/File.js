import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Assuming it relates to a user
});

// Prevent overwriting the model if it's already registered
const File = mongoose.models.File || mongoose.model('File', FileSchema);

export default File;
