import HeroController from './controller'
import policy from './policy'

module.exports = app => {
    app.route('/api/hero/test/:hero').get(
        async (req, res) => {
            try {
                const results = await HeroController.test(req.params.hero === 'batman')
                res.status(200).json(results)
            } catch (e) {
                res.status(400).json(e)
            }
        }
    )
    app.route('/api/hero/create/:heroName').get(
        async (req, res) => {
            try {
                const results = await HeroController.create(req.params.heroName)
                res.status(200).json(results)
            } catch (e) {
                res.status(400).json(e)
            }
        }
    )
    app.route('/api/hero/list').get(
        async (req, res) => {
          try {
            const results = await HeroController.read()
            res.status(200).json(results)
          } catch (e) {
            res.status(400).json(e)
          }
        }
      )
}