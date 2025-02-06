import mongoose from 'mongoose'
const Schema = mongoose.Schema

const PictureSchema = new Schema({
    title: {
        type: String
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

mongoose.model('Picture', PictureSchema)