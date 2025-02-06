import mongoose from 'mongoose'
import ApplicationsController from '../application/controller'
const Picture = mongoose.model('Picture')

function PictureController() {}

    PictureController.create = async req => {
        const {body} = req
                try {
                    const picture = new Picture({title: body.title, date_created: body.date_created, date_ended: body.date_ended, year: body.year, media_id: body.media_id})
                    const results = await picture.save()
                    return results
                    
                } catch (e) {
                    console.log('e1', e)
                    throw ApplicationsController.getErrorMessage(e)
                }

        
    }

    PictureController.read = async () => {
        try {
            const results = await Picture.find()
            return results
        } catch (e) {
            throw ApplicationsController.getErrorMessage(e)
        }
    }

    PictureController.delete = (_id) => {
        return new Promise(async (resolve, reject) => {
          const pictureFile = await Picture.findById(_id)
          console.log('file', pictureFile)
          if (_id) {
            await Picture.findByIdAndDelete(_id)
          } else {
            reject('User not authorized!')
          }
        })
      }

export default PictureController