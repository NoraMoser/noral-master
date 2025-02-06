import _ from 'lodash'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import ApplicationController from '../../application/controller'
import cookieParser from 'cookie-parser'
const User = mongoose.model('User')
const Session = mongoose.model('Session')
const cert = fs.readFileSync(path.resolve('./server/conf/ssl/server.key'))
const pubCert = fs.readFileSync(path.resolve('./server/conf/ssl/server.pem'))
const {APP_SESSION_SECRET} = process.env

function UserAuthController() {}

/**
 * ======================================================================================
 * Authentication
 * ======================================================================================
 */

/**
 * Create session
 */
UserAuthController.createToken = async (req, user) => {
  try {
    const data = {...user._doc}
    const token = await jwt.sign({ data }, cert, { algorithm: 'RS256' })
    req.session.user = user._id
    req.session.token = token
    req.session.ipAddress = req.connection.remoteAddress
    req.session.userAgent = req.headers['user-agent']
    user.password = undefined
    return user
  } catch (e) {
    throw { error: ApplicationController.getErrorMessage(e) }
  }
}

UserAuthController.authorize = async (req, loginOnly = false) => {
  try {
    // Check if session is expired
    const expiration = moment(req.session.cookie.expires)
    const now = moment(new Date())
    const expired =  expiration < now

    // Verify Token
    const token = req.session.token

    if (token && !expired && req.cookies.user) {
      const userNonAuthenticated = await UserAuthController.parseToken(token)
      
      // Check user session
      const sessionId = cookieParser(APP_SESSION_SECRET)(req, {}, () => {
        return req.signedCookies.sessionId
      })
      
      const user = await User.findOne({ 
        username: userNonAuthenticated.username, 
        password: userNonAuthenticated.password,
        sessionId
      }, '-salt -accountVerificationToken, -password, -sessionId')
      
      const isAuthorized = !!user && !expired
      
      if (!isAuthorized && !loginOnly) throw 'User is not authorized'
      
      return !loginOnly ? user.roles : isAuthorized
    } 
    else if (loginOnly) return false
    else throw 'User is not authorized'
  } 
  catch (e) {
    throw { error: ApplicationController.getErrorMessage(e) }
  } 
}

/**
 * Close Session
 */
UserAuthController.closeSession = async (req) => {
  try {
    req.session.destroy()
    return true
  } catch (e) {
    throw { error: ApplicationController.getErrorMessage(e) }
  }
}

UserAuthController.addSocketIdToSession = async (req, token, socketId) => {
  try {
    cookieParser(APP_SESSION_SECRET)(req, {}, (err) => {
      console.log('signed', req.cookie)
    })
    // const session = await Session.findOne({token})
    // session.socketId = socketId
    // const updatedSession = session.save()
    return 'yep'
  }
  catch (e) {
    // Do nothing throw { error: ApplicationController.getErrorMessage(e) }
  }
}

UserAuthController.checkIfUserHasCurrentSession = async (user) => {
  try {
    const session = await Session.findOne({user}).sort('-expires')
    const currentDate = new Date()
    const isUserSignedIn = moment(new Date(session.expires)) > moment(currentDate)
    const response = {
      isUserSignedIn,
      socketId: session.socketId
    }
    return response
  }
  catch(e) {
    throw { error: ApplicationController.getErrorMessage(e) }
  }
}

UserAuthController.parseToken = async (token) => {
  const tokenUser = token ? await jwt.verify(token, pubCert, { algorithms: ['RS256'] }) : {data: {}}
  return tokenUser.data
}
export default UserAuthController