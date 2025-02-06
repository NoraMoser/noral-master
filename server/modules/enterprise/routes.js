import EnterpriseController from './controller'
import * as policy from './policy'

module.exports = function (app) {

  app.route('/api/enterprise/application').get(
    async (req, res) => {
      try {
        const results = await EnterpriseController.readApplicaton()
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/enterprise/find-one/:by/:data').get(
    policy.isAllowed, 
    async (req, res) => {
      const { by, data } = req.params
      try {
        const results = await EnterpriseController.findOne(by, data)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/enterprise/create').post(
    policy.isAllowed, 
    async (req, res) => {
      const { body } = req
      try {
        const results = await EnterpriseController.create(body)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/enterprise/update').put(
    policy.isAllowed, 
    async (req, res) => {
      try {
        const results = await EnterpriseController.update(req)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/enterprise/by-id/:id').get(
    policy.isAllowed, 
    async (req, res) => {
      const { id } = req.params
      try {
        const results = await EnterpriseController.read(id)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/enterprise/list').get(
    policy.isAllowed, 
    async (req, res) => {
      const { query } = req
      try {
        const results = await EnterpriseController.list(query)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.get('/api/enterprise/schema',
    async (req, res) => {
      try {
        const results = await EnterpriseController.schema()
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      } 
    }
  )
}
