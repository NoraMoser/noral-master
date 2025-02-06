import mongoose from 'mongoose'
const Schema = mongoose.Schema

const VideoSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    date_created: {
        type: String
    },
    date_ended: {
        type: String
    },
    year: {
        type: String
    },
    media_id: {
        type: String
    }
})

mongoose.model('Video', VideoSchema)