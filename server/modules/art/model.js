import mongoose from 'mongoose'
const Schema = mongoose.Schema

const ArtSchema = new Schema({
    title: {
        type: String
    },
    date_created: {
        type: String
    },
    age: {
        type: Number
    },
    name: {
        type: String
    },
    media_id: {
        type: String
    }
})

mongoose.model('Art', ArtSchema)