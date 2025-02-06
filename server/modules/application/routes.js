import ApplicationController from './controller'

module.exports = (app) => {
  app.route('/api/application/version').get(
    async (req, res) => {
      try {
        const results = await ApplicationController.getApplicationVersion()
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/application/cpu').get(
    async (req, res) => {
      try {
        const results = await ApplicationController.getCpuUsage()
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }        
    }
  )

  // app.route('/api/application/diskSpace').get(
  //   async (req, res) => {
  //     try {
  //       const results = await ApplicationController.getDiskSpace()
  //       res.status(200).json(results)
  //     } catch (e) {
  //       res.status(400).json(e)
  //     }        
  //   }
  // )
}
