import UserAccountController from './controllers/user.account.controller'
import UserAuthController from './controllers/user.auth.controller'
import UserPasswordController from './controllers/user.password.controller'
import UserVerficationController from './controllers/user.verification.controller'
import UserDataController from './controllers/user.data.controller'
import conf from '../../conf/conf'
import Cookies from 'cookies'
import * as policy from './policy'

module.exports = app => {

  /****************************************************************************
   * User Auth
  *****************************************************************************/
  app.get('/api/user/auth/session-close', 
    policy.isAllowed,
    async (req, res) => {
      try {
        const results = await UserAuthController.closeSession(req)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.get('/api/user/auth/authorization',
    async (req, res) => {
      try {
        const results = await UserAuthController.authorize(req)
        res.status(200).json(results)
      } catch (e) {
        res.status(401).json(e)
      }
    }
  )

  app.get('/api/user/auth/check-user-session',
    async (req, res) => {
      try {
        const results = await UserAuthController.authorize(req, true)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  /****************************************************************************
   * User Account
  *****************************************************************************/
  app.post('/api/user/sign-up',
    async (req, res) => {
      try {
        const results = await UserAccountController.signUp(req.body, res)
        console.log(results)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.post('/api/user/sign-in', 
    async (req, res) => {
      try {
        const {userAuthenticated, userData} = await UserAccountController.signIn(req, res)

        // THIS SETS USER AND AUTH COOKIES
        const cookies = new Cookies(req, res, { keys: [conf.sessionSecret] })
        if (!userData.needsVerification) cookies.set('user', JSON.stringify(userAuthenticated), { httpOnly: false })
        
        res.status(200).json(userData)
      } catch (e) {
        console.log(e)
        res.status(400).json(e)
      } 
    }
  )

  /****************************************************************************
   * User Data
  *****************************************************************************/
  app.route('/api/user/list/:criteria').get(
    policy.isAllowed,
    async (req, res) => {
      const {criteria} = req.params
      try {
        const results = await UserDataController.list(criteria)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/user/read/:criteria').get(
    async (req, res) => {
      const {params, session} = req
      const {criteria} = params
      const {token} = session
      try {
        const results = await UserDataController.read(JSON.parse(criteria), token)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/user/update').put(
    policy.isAllowed, 
    async (req, res) => {
      try {
        const results = await UserDataController.update(req)
        // THIS SETS USER AND AUTH COOKIES
        const cookies = new Cookies(req, res, { keys: [conf.sessionSecret] })
        cookies.set('user', JSON.stringify(results), { httpOnly: false })

        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  /****************************************************************************
   * User Contacts
  *****************************************************************************/
  app.route('/api/user/contact/delete/:id').put(
    policy.isAllowed,
    async (req, res) => {
      try {
        const {id} = req.params
        const {token} = req.session
        const results = await UserDataController.deleteContact(id, token)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )
  /****************************************************************************
   * User Verification
  *****************************************************************************/
  app.post('/api/user/verification/email',
    async (req, res) => {
      try {
        const results = await UserVerficationController.verifyEmailAddress(req.body)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.get('/api/user/verification/email/send/:email', 
    async (req, res) => {
      try {
        const results = await UserVerficationController.verificationEmailSend(req.params.email, res)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  /****************************************************************************
   * User Password
  *****************************************************************************/
  app.get('/api/user/password/forgot/:email', 
    async (req, res) => {
      try {
        const results = await UserPasswordController.forgotPassword(req.params.email, res)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.post('/api/user/password/reset/:token', 
    async (req, res) => {
      try {
        const results = await UserPasswordController.validateResetPasswordToken(req.params.token, req.body.password, res)
        res.status(200).json(results)
      } catch (e) {
        res.status(400).json(e)
      }
    }
  )

  app.route('/api/user/password/change').put(
    policy.isAllowed, 
    async (req, res) => {
      try {
        const results = await UserPasswordController.changePassword(req, res)
        res.status(200).json(results)
      } catch (e) {
        console.log('error', e)
        res.status(400).json(e)
      }
    }
  )
}
