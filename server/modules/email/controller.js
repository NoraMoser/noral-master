import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import ApplicationController from '../application/controller'
import logger from '../../conf/lib/logger'
const Email = mongoose.model('Email')

function EmailController() {}

/************************************************
 * List email address
 ************************************************/
EmailController.list = async () => {
  try {
    const titles = await Email.schema.path('title').enumValues
    if (!titles) { 
      throw 'Something went wrong!'
    }

    const count = await Email.countDocuments()
    if (count === 0) { await createEmails(titles) }

    const results = await Email.find()
    return results
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Get email by type
 ************************************************/
EmailController.emailByType = async (title) => {
  logger.debug(`EMAIL TYPE - ${title}`)
  try {
    const email = Email.findOne({ title })
    return email
  } catch (err) {
   throw ApplicationController.getErrorMessage(err) 
  }
}

/************************************************
 * Update email
 ************************************************/
EmailController.update = async (emailAddress) => {
  try {
    const results = await Email.findOneAndUpdate({_id: emailAddress._id}, emailAddress)
    return results
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Send email
 ************************************************/
EmailController.sendEmail = async (res, data) => {
  try {
    const {type, template, templateData, to, subject} = data
    await res.render(
      template, 
      templateData,
      async (err, html) => { 
        if (err) {
          throw err
        } else {
          const email = await EmailController.emailByType(type)
          const from = `"${email.from}" <${email.smtpConfig.auth.user}>`
          const options = { to, from, subject, html }
          const smtpTransport = await nodemailer.createTransport(email.smtpConfig)
          await smtpTransport.sendMail(options)
          logger.debug('EMAIL SENT')
        }
      }
    )
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Create emails
 ************************************************/
async function createEmails(titles) {
  try {
    const promises = titles.map(title => {
      const newEmail = new Email({title})
      return newEmail.save()
    })
    const results = await Promise.all(promises)
    return results
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

export default EmailController