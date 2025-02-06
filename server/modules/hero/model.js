import mongoose from 'mongoose'
const Schema = mongoose.Schema

const HeroSchema = new Schema({
    name: {
        type: String,
        unique: true
    }
})

mongoose.model('Hero', HeroSchema)