import mongoose from 'mongoose'
import ApplicationController from '../../application/controller'
import { createQuery } from '../../../utilities'
import UserAuthController from './user.auth.controller'
const User = mongoose.model('User')
const FIELDS_BLACKLISTED = '-salt -password -accountVerificationToken -resetPasswordToken -resetPasswordExpires -requireChangePassword -verification -lastModifiedBy -lastModifiedDate -sessionId -__v'
const FIELDS_RESTRICTED = '-email -mobile'
const SECURE_USER_INFO = 'displayName profileImage username'

function UserDataController() {}

/**
 * Query
 */
UserDataController.list = async criteria => {
  const {take, skip, filter, sort} = JSON.parse(criteria)
  const query = createQuery(filter)
  try {
    const data = await User
      .find(query, FIELDS_BLACKLISTED + ' ' + FIELDS_RESTRICTED)
      .skip(skip)
      .limit(take)
      .sort(sort)
      .populate('enterprise', '_id companyName')
    const total = await User.count(query)
    const results = {
      data,
      total
    }
    return results
  } catch(e) {
    throw ApplicationController.getErrorMessage(e)
  }
}

/**
 * Read
 */
UserDataController.read = async (criteria, token) => { 
  const {username, _id} = criteria
  const client = await UserAuthController.parseToken(token)
  const {username: clientUsername, _id: clientId} = client
  const isSelf = (username && username === clientUsername) || (_id && _id == clientId)
  try {
    const user = await User
      .findOne(criteria, FIELDS_BLACKLISTED + ' ' + FIELDS_RESTRICTED)
      .populate(isSelf 
        ? {
          path: 'requests', 
          match: {response: 'pending'},
          populate: {
            path: 'from',
            model: 'User',
            select: SECURE_USER_INFO
          }
        } 
        : ''
      )
      .populate(isSelf 
        ? {
          path: 'notifications', 
          populate: {
            path: 'from',
            model: 'User',
            select: SECURE_USER_INFO
          }
        } 
        : ''
      )
      .populate('contacts', SECURE_USER_INFO)
    return user
  } catch (e) {
    throw ApplicationController.getErrorMessage(e)
  }
}

UserDataController.update = async req => {
  const update = req.body
  const sysUser = await UserAuthController.parseToken(req.session.token)
  const isAdmin = sysUser.roles.includes('admin') || sysUser.roles.includes('superadmin')
  if (sysUser._id === update._id || isAdmin) {
    try {
      delete update.salt        
      if (!isAdmin) {
        delete update.password
        delete update.roles
        delete update.verification
      }
      update.lastModifiedBy = sysUser._id
      update.lastModifiedDate = Date.now()
      update.displayName = `${update.firstName} ${update.lastName}`
      await User.findByIdAndUpdate(update._id, update)
      const user = await UserDataController.read({_id: update._id}, req.session.token)
      return user
    } catch (e) {
      throw ApplicationController.getErrorMessage(e)
    }
  } else {
    throw 'Something went wrong!'
  }
}

UserDataController.deleteContact = async (_id, token) => {
  try {
    const sysUser = await UserAuthController.parseToken(token)
    const user1 = await UserDataController.read({_id: sysUser._id}, token)
    const user2 = await UserDataController.read({_id}, token)
    const index1 = user1.contacts.find(contact => contact._id == _id)
    const index2 = user2.contacts.find(contact => contact === user1._id)
    user1.contacts.splice(index1, 1)
    user2.contacts.splice(index2, 1)
    await user1.save()
    await user2.save()
    return user1
  }
  catch(e) {
    throw ApplicationController.getErrorMessage(e)
  }
}
export default UserDataController