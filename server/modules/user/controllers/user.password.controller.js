import ApplicationsController from '../../application/controller'
import mongoose from 'mongoose'
import crypto from 'crypto'
import path from 'path'
import UserAuthController from './user.auth.controller'
import EmailController from '../../email/controller'
import conf from '../../../conf/conf'
import logger from '../../../conf/lib/logger'
const User = mongoose.model('User')
const {APP_TITLE} = process.env

function UserPasswordController() {}

/**
 * ======================================================================================
 * Password
 * ======================================================================================
 */

UserPasswordController.forgotPassword = async (email, res) => {
  const resetPasswordToken = await crypto.randomBytes(20).toString('hex')
  const resetPasswordExpires = Date.now() + 3600000 // 1 hour
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { resetPasswordToken, resetPasswordExpires}
    )
    await user.save()

    const emailArgs = {
      type: 'Support',
      template: path.resolve('./server/modules/email/templates/reset-password-email.server.view.html'),
      templateData: {
        name: user.displayName,
        appName: APP_TITLE,
        url: `${conf.app.protocol}://${conf.app.host}/user/password/reset/${resetPasswordToken}`
      },
      to: user.email,
      subject: 'Reset Your Password',
    }

    await EmailController.sendEmail(res, emailArgs)
  } 
  catch (e) {
    logger.debug(e, 'error')
  }
  finally {
    return `If an account associated with ${email.toLowerCase().trim()} was located, \
    an email with further instructions has been sent. Please follow the instructions in \
    the email to reset your password. If you don't see the email in your inbox, you may want \
    to check your JUNK EMAIL FOLDER.`
  }
}

/**
 * Reset password GET from email token
 */
UserPasswordController.validateResetPasswordToken = async (resetPasswordToken, password, res) => {
  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } })
    if (!user) throw 'Password reset token is invalid or has expired'
    await resetPassword(user, password, res)
    return 'Your password was changed. Please sign in to continue.'
  } catch (e) {
    throw ApplicationsController.getErrorMessage(e)
  }
}

/**
 * Change Password
 */
UserPasswordController.changePassword = async (req, res) => {
  try {
    const { _id, password: passwordClearText, newPassword: newPasswordClearText } = req.body
    console.log('here')
    const userNonAuthenticated = await User.findById(_id, '-password')
    console.log('non', userNonAuthenticated)
    const password = UserPasswordController.hashPassword(userNonAuthenticated.salt, passwordClearText)
    const userAuthenticated = await User
      .findOne({ _id, password }, '-salt -accountVerificationToken')
      .populate('enterprise', '_id companyName token')
    console.log('aut', userAuthenticated)
    if (!userAuthenticated) throw 'The current password provided was incorrect!'

    await resetPassword(userAuthenticated, newPasswordClearText, res)

    const user = await User
      .findById(_id, '-salt -accountVerificationToken')
      .populate('enterprise', '_id companyName token')
    
    const results = await UserAuthController.createToken(req, user)
    await notififyUserOfPasswordChange(user, res)
    return results
  } catch (e) {
    console.log(e)
    throw ApplicationsController.getErrorMessage(e)
  }
}

/**
 * Reset password POST from email token
 */
async function resetPassword(user, password, res) {
  try{
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    await notififyUserOfPasswordChange(user, res)
    return true 
  } catch (e) {
    throw ApplicationsController.getErrorMessage(e)
  }
}

/**
 * Hash password
 */
UserPasswordController.hashPassword = (salt, password) => {
  if (salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer.from(salt, 'base64'), 10000, 64, 'SHA1').toString('base64')
  } else {
    return password
  }
}

async function notififyUserOfPasswordChange(user, res) {
  const emailArgs = {
    type: 'Support',
    template: path.resolve('./server/modules/email/templates/reset-password-confirm-email.server.view.html'),
    templateData: {
      name: user.displayName,
      appName: APP_TITLE
    },
    to: user.email,
    subject: 'Your password was changed'
  }

  try {
    await EmailController.sendEmail(res, emailArgs)
    return true
  } catch(e) {
    throw ApplicationsController.getErrorMessage(e)
  }
}

export default UserPasswordController