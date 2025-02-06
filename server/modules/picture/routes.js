import PictureController from './controller'

module.exports = app => {
    app.route('/api/picture/create').post(
        async (req, res) => {
            try {
                const results = await PictureController.create(req)
                res.status(200).json(results)
            } catch (e) {
                console.log('e', e)
                res.status(400).json(e)
            }
        }
    )

    app.route('/api/picture/list').get(
        async (req, res) => {
          try {
            const results = await PictureController.read()
            res.status(200).json(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )

      app.route('/api/picture/delete/:id').delete(
        async (req, res) => {
          try {
            const results = await PictureController.delete(req.params.id)
            res.status(200).send(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )
}