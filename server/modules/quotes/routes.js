import QuoteController from './controller'

module.exports = app => {
    app.route('/api/quote/create').post(
        async (req, res) => {
            try {
                const results = await QuoteController.create(req)
                res.status(200).json(results)
            } catch (e) {
                console.log('e', e)
                res.status(400).json(e)
            }
        }
    )

    app.route('/api/quote/list').get(
        async (req, res) => {
          try {
            const results = await QuoteController.read()
            res.status(200).json(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )
}