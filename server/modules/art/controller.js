import mongoose from 'mongoose'
import ApplicationsController from '../application/controller'
const Art = mongoose.model('Art')

function ArtController() {}

    ArtController.create = async req => {
        const {body} = req
                try {
                    const art = new Art({title: body.title, date_created: body.date_created, age: body.age, name: body.name, media_id: body.media_id})
                    const results = await art.save()
                    return results
                    
                } catch (e) {
                    console.log('e1', e)
                    throw ApplicationsController.getErrorMessage(e)
                }

        
    }

    ArtController.read = async () => {
        try {
            const results = await Art.find()
            return results
        } catch (e) {
            throw ApplicationsController.getErrorMessage(e)
        }
    }

    ArtController.delete = (_id) => {
        return new Promise(async (resolve, reject) => {
          const ArtFile = await Art.findById(_id)
          console.log('file', ArtFile)
          if (_id) {
            await Art.findByIdAndDelete(_id)
          } else {
            reject('User not authorized!')
          }
        })
      }

export default ArtController