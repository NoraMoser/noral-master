import mongoose from 'mongoose'
import path from 'path'
import conf from '../../../conf/conf'
import EmailController from '../../email/controller'
import ApplicationController from '../../application/controller'
const User = mongoose.model('User')
const ERROR_EMAIL = 'We were unable to verify your email address!'
const SUCCESS_EMAIL_SENT = 'The account verification email has been sent to'
const SUCCESS_EMAIL_VERIFIED = 'Your email address was successfully verified!'
const {APP_TITLE} = process.env

function UserVerificationController() {}
/**
 * Account verification
 */
UserVerificationController.verifyEmailAddress = async ({ emailVerificationToken, _id }) => {
  try {
    const user = await User.findOne({ _id })

    if (!user || user.emailVerificationToken !== emailVerificationToken) {
      throw ERROR_EMAIL 
    } else if (!user.verification.includes('email')) {
      user.verification.push('email')
      await user.save()      
    }
    return SUCCESS_EMAIL_VERIFIED
  } catch (e) {
    throw ApplicationController.getErrorMessage(e)
  }
}

/**
 * Resend verification email
 */
UserVerificationController.verificationEmailSend = async (email, res) => {
  try {
    const user = await User.findOne({ email })
    const emailArgs = {
      type: 'Support',
      template: path.resolve('./server/modules/email/templates/confirm-email-address.server.view.html'),
      templateData: {
        name: user.displayName,
        appName: APP_TITLE,
        url: `${conf.app.protocol}://${conf.app.host}/user/verification/email/verify/${user._id}/${user.accountVerificationToken}`
      },
      to: user.email,
      subject: 'Confirm Your Email Address'
    }
  
    await EmailController.sendEmail(res, emailArgs)
    return `${SUCCESS_EMAIL_SENT} ${email}.`
  } catch (e) {
    throw ApplicationController.getErrorMessage(e)
  }
}

export default UserVerificationController