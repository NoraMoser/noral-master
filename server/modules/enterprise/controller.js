import path from 'path'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import fs from 'fs'
import * as utilities from '../../utilities'
import ApplicationController from '../application/controller'
import conf from '../../conf/conf'
const Enterprise = mongoose.model('Enterprise')
const cert = fs.readFileSync(path.resolve('./server/conf/ssl/server.key'))

function EnterpriseController() {}

/************************************************
 * Create enterprise
 ************************************************/
EnterpriseController.create = async data => {
  try {
    delete data.application
    const token = await jwt.sign({ data }, cert, { algorithm: 'RS256' })
    data.token = token
    const newEnterprise = new Enterprise(data)
    const enterprise = await newEnterprise.save()
    return enterprise
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Get enterprise
 ************************************************/
EnterpriseController.read = async _id => {
  try {
    const enterprise = await Enterprise.findById(_id)
    return enterprise
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Read enterprise associated with the app
 ************************************************/
EnterpriseController.readApplicaton = async () => {
  try {
    const total = await Enterprise.countDocuments()
    if (!total) {
      const data = {
        active: true,
        application: true,
        companyName: conf.app.title
      }
      const token = await jwt.sign({ data }, cert, { algorithm: 'RS256' })
      data.token = token
      const newEnterprise = new Enterprise(data)
      await newEnterprise.save()
    }
    const enterprise = await Enterprise.findOne({application: true})
    return enterprise
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Get enterprise
 ************************************************/
EnterpriseController.findOne = async (by, data) => {
  try {
    const enterprise = await Enterprise
      .findOne({ [by]: data }, '-token -lastModified -lastModifiedBy -EIN')

    if (!enterprise) {
      throw 'No results found!' 
    }
    return enterprise
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * List enterprise
 ************************************************/
EnterpriseController.list = async ({ take, skip, sort, filter, remove }) => {
  const createSort = utilities.sort(sort, { title: 'asc' })
  const createFilters = filter ? utilities.filter(filter.logic, filter.filters) : {}
  try {
    const total = await Enterprise.countDocuments(createFilters)
    const data = await Enterprise
      .find(createFilters, remove)
      .skip(Number(skip))
      .limit(Number(take))
      .sort(createSort)
    const results = {
      data,
      total
    }
    return results
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

/************************************************
 * Update enterprise
 ************************************************/
EnterpriseController.update = async (req) => {
  const { body } = req
  try {
    await Enterprise.findByIdAndUpdate(body._id, body)
    const enterprise = Enterprise.findById(body._id)
    return enterprise
  } catch (err) {
    throw ApplicationController.getErrorMessage(err)
  }
}

export default EnterpriseController