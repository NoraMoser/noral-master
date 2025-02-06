import mongoose from 'mongoose'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import ApplicationController from '../../application/controller'
import UserAuthController from './user.auth.controller'
import UserDataController from './user.data.controller'
import UserPasswordController from './user.password.controller'
import logger from '../../../conf/lib/logger'
const User = mongoose.model('User')
const FIELDS_BLACKLISTED = '-salt -password -accountVerificationToken -resetPasswordToken -resetPasswordExpires -requireChangePassword -verification -lastModifiedBy -lastModifiedDate -__v'
const ERROR_NO_USER = 'No user exists with these credentials! Maybe you mistyped something?'
const ERROR_NO_LONGER_AUTHORIZED = 'You are no longer authorized to access this account. Please contact your admin for more information.'
const SUCCESS_USER_REGISTERED = 'You account was successfully registered! Please verify your email address to continue.'
const SUCCESS_ADMIN_SETUP = 'Admin setup complete!'
const {SESSION_SECRET} = process.env

function UserAccountController() {}

/**
 * Create
 */
UserAccountController.signUp = async (userInfo) => {
  console.log(userInfo)
  try {
    const userCount = await User.countDocuments()
    const token = await crypto.randomBytes(20).toString('hex')

    userInfo.roles = !userCount ? ['user', 'admin', 'superadmin'] : ['user']
    userInfo.verification = !userCount ? ['email'] : [] 
    userInfo.displayName = userInfo.firstName + ' ' + userInfo.lastName
    userInfo.email = userInfo.email.toLowerCase().trim()
    userInfo.accountVerificationToken = token

    await new User(userInfo).save()

    return {
      message: !userCount ? SUCCESS_ADMIN_SETUP : SUCCESS_USER_REGISTERED,
      accountType: 'user'
    }
  } catch (e) {
    throw ApplicationController.getErrorMessage(e)
  }
}

/**
 * Login
 */
UserAccountController.signIn = async (req) => {
  try {
    const { user: userInfo, password: passwordClearText  } = req.body
    const userNonAuthenticated = await User.findOne(
      { 
        $or: [
          // { email: userInfo.toLowerCase().trim() }, 
          { username: userInfo.trim() }
        ] 
      }, 
      '-password'
    )
    console.log(userNonAuthenticated)
    if (!userNonAuthenticated) throw ERROR_NO_USER
    const password = UserPasswordController.hashPassword(userNonAuthenticated.salt, passwordClearText)
    console.log(password)

    // Validate user
    const userAuthenticated = await User.findOne({ _id: userNonAuthenticated._id, password }, '-salt -accountVerificationToken -sessionId -contacts -requests -notifications')

    if (!userAuthenticated) throw ERROR_NO_USER
    else if (!userAuthenticated.roles.length) throw ERROR_NO_LONGER_AUTHORIZED
    // else if (!userAuthenticated.verification.includes('email')) {
    //   const verificationNeeded = { 
    //     userData: {
    //       needsVerification: true, 
    //       error: 'You must verify your email address before signing in',
    //       email: userAuthenticated.email 
    //     }
    //   }
    //   return verificationNeeded
    // }

    // Save user sessionId
    userAuthenticated.sessionId = cookieParser(SESSION_SECRET)(req, {}, () => req.signedCookies.sessionId)
    await userAuthenticated.save()

    // Create token
    await UserAuthController.createToken(req, userAuthenticated)

    // Retreive user data
    const userData = await UserDataController.read({_id: userAuthenticated._id}, req.session.token)
    return {userAuthenticated, userData}
  } catch (e) {
    logger.debug(e)
    throw ApplicationController.getErrorMessage(e)
  }
}

export default UserAccountController