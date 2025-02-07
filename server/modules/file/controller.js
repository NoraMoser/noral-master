import mongoose from 'mongoose'
import ApplicationController from '../application/controller'
import formidable from 'formidable'
import { createBucket, createModel } from 'mongoose-gridfs'
import fs from 'fs'
import crypto from 'crypto'
import File from '../../modules/file/File'
const File = mongoose.model('File')

function FileController() {}

/************************************************
 * Stream file
 ************************************************/
FileController.streamFile = async (_id) => {
  return new Promise(async (resolve, reject) => {
    const model = await createModel({ modelName: 'fs' })
    const file = await File.findById(_id)
    model.findById(file.data, (err, modelFile) => { 
      if (err) reject(ApplicationController.getErrorMessage(err))
      const readstream = modelFile.read() 
      const chunks = []
      readstream.on('error', err => reject(ApplicationController.getErrorMessage(err)))
      readstream.on('data', chunk => chunks.push(chunk))
      readstream.on('end', () => resolve({type: file.type, buffer: Buffer.concat(chunks)}))
    })
  })
}

/************************************************
 * Upload file
 ************************************************/
FileController.upload = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm()
    // 1GB Max
    form.maxFileSize = 10 * 1000 * 1024 * 1024
    form.parse(req, async (err, fields, files) => {
      if (err) reject(ApplicationController.getErrorMessage(err))
      try {
        const dataId = await createFile(files.image_id)
        console.log(files)
        const file = new File({
          data: dataId,
          name: files.image_id.name,
          size: files.image_id.size,
          type: files.image_id.type,
          user: req.session.user
        })
        const savedFile = await file.save()
        resolve(savedFile._id)
      } catch (err) {
        reject(ApplicationController.getErrorMessage(err))
      }
    })
  })
}

/************************************************
 * Delete file
 ************************************************/
FileController.delete = (_id, token, override = false) => {
  return new Promise(async (resolve, reject) => {
  //   const sysUser = await UserAuthController.parseToken(token)
  //   console.log('user', sysUser)
  //   const isAdmin = sysUser.roles.includes('admin') || sysUser.roles.includes('superadmin')
  //   console.log('is admin', isAdmin)
    const file = await File.findById(_id)
    console.log('file', file)
    if (_id) {
      const model = await createModel({ modelName: 'fs' })
      await File.findByIdAndDelete(_id)
      model.unlink(file.data, () => {
        resolve(true)
      })
    } else {
      reject('User not authorized!')
    }
  })
}

async function createFile(file) {
  const FileBucket = await createBucket({ bucketName: 'fs' })
  const filenameSplit = file.name.split('.')
  const fileExt = `.${filenameSplit.length ? filenameSplit[filenameSplit.length - 1] : unknown}`
  const filename = crypto.createHmac('sha256', file.name + new Date()).digest('hex') + fileExt
  const fileOptions = {
    filename
  }
  const fileStream = fs.createReadStream(file.path)
  try {
    const writtenFile = await FileBucket.writeFile(fileOptions, fileStream)
    return writtenFile.options._id
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

export default FileController