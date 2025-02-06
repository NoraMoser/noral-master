import mongoose from 'mongoose'
import ApplicationsController from '../application/controller'
const Hero = mongoose.model('Hero')

function HeroController() {}

HeroController.test = async (isBatman) => {
    return isBatman
}

HeroController.create = async (name) => {
    try {
        const hero = new Hero({name})
        await hero.save()
        return {message: 'yup'}
    } catch (e) {
        throw ApplicationsController.getErrorMessage(e)
    }
}

HeroController.read = async () => {
    try {
        const results = await Hero.find()
        console.log(results)
        return results
    } catch (e) {
        throw ApplicationsController.getErrorMessage(e)
    }
}
export default HeroController



