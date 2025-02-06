import VideoController from './controller'

module.exports = app => {
    app.route('/api/video/create').post(
        async (req, res) => {
            try {
                const results = await VideoController.create(req)
                res.status(200).json(results)
            } catch (e) {
                console.log('e', e)
                res.status(400).json(e)
            }
        }
    )

    app.route('/api/video/list').get(
        async (req, res) => {
          try {
            const results = await VideoController.read()
            res.status(200).json(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )
}