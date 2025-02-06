import mongoose from 'mongoose'
const Schema = mongoose.Schema

const QuoteSchema = new Schema({
    author: {
        type: String
    },
    age: {
        type: Number
    },
    quote: {
        type: String
    }
})

mongoose.model('Quote', QuoteSchema)