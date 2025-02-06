import ArtController from './controller'

module.exports = app => {
    app.route('/api/art/create').post(
        async (req, res) => {
            try {
                const results = await ArtController.create(req)
                res.status(200).json(results)
            } catch (e) {
                console.log('e', e)
                res.status(400).json(e)
            }
        }
    )

    app.route('/api/art/list').get(
        async (req, res) => {
          try {
            const results = await ArtController.read()
            res.status(200).json(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )

      app.route('/api/art/delete/:id').delete(
        async (req, res) => {
          try {
            const results = await ArtController.delete(req.params.id)
            res.status(200).send(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )
}