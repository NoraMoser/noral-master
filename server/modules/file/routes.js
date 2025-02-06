import FileController from './controller'
import * as policy from './policy'


module.exports = (app) => {

  app.route('/api/file/:id').get(
    async (req, res) => {
      const { id } = req.params
      try {
        const results = await FileController.streamFile(id)
        res.setHeader('Content-Disposition', 'inline')
        res.setHeader('Content-Type', results.type)
        res.status(200).send(results.buffer)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/file/upload').post(
    async (req, res) => {
      try {
        const results = await FileController.upload(req)
        res.status(200).send(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/file/delete/:id').delete(
    async (req, res) => {
      console.log('req', req)
      try {
        const results = await FileController.delete(req.params.id, req.session.token)
        res.status(200).send(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )
}
