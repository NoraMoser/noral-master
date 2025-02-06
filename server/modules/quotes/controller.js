import mongoose from 'mongoose'
import ApplicationsController from '../application/controller'
const Quote = mongoose.model('Quote')

function QuoteController() {}

    QuoteController.create = async req => {
        console.log('req', req)
        const {body} = req
                try {
                    const quote = new Quote({author: body.author, age: body.age, quote: body.quote})
                    const results = await quote.save()
                    return results
                    
                } catch (e) {
                    console.log('e1', e)
                    throw ApplicationsController.getErrorMessage(e)
                }

        
    }

    QuoteController.read = async () => {
        try {
            const results = await Quote.find()
            return results
        } catch (e) {
            throw ApplicationsController.getErrorMessage(e)
        }
    }

export default QuoteController