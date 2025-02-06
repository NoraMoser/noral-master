import mongoose from 'mongoose'
import ApplicationsController from '../application/controller'
const Video = mongoose.model('Video')

function VideoController() {}

    VideoController.create = async req => {
        console.log('req', req)
        const {body} = req
                try {
                    const video = new Video({title: body.title, date_created: body.date_created, date_ended: body.date_ended, year: body.year, media_id: body.media_id})
                    const results = await video.save()
                    return results
                    
                } catch (e) {
                    throw ApplicationsController.getErrorMessage(e)
                }

        
    }

    VideoController.read = async () => {
        try {
            const results = await Video.find()
            return results
        } catch (e) {
            throw ApplicationsController.getErrorMessage(e)
        }
    }

export default VideoController