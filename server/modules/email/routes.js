import EmailController from './controller'
import * as policy from './policy'

module.exports = function (app) {
  app.route('/api/email/list/application').get(
    // policy.isAllowed, 
    async (req, res) => {
      try {
        const results = await EmailController.list()
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(err)
      }
    }
  )

  app.route('/api/email/update/application').put(
    policy.isAllowed, 
    async (req, res) => {
      const {body} = req
      try {
        const results = await EmailController.update(body)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(err)
      }
    }
  )
}
