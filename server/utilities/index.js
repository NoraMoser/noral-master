import moment from 'moment'
import UserDataController from '../modules/user/controllers/user.data.controller'

export const sort = (sort, defautSort) => {
  return sort ? JSON.parse(sort)[0] : defautSort
}

export function handleFilterSet(filterSet) {
  const adjustedFilters = filterSet.filters.map(filter => {
    const isDate = filter.value.toString().includes('GMT')
    const value = isDate ? new Date(filter.value) : filter.value
    if (value) {
      filter.value = checkOperator(filter.operator, value, isDate)
      const filterObject = {[filter.field]: filter.value}
      return filterObject
    }
    return {}
  })
  return filterSet.logic === 'and' ? { $and: adjustedFilters } : { $or: adjustedFilters }
}

export function createQuery(filter) {
  const mappedFilters = filter.filterSets.map(filterSet => handleFilterSet(filterSet))
  const query = filter.logic === 'and' ? { $and: mappedFilters } : { $or: mappedFilters }
  return mappedFilters.length ? query : void 0
}

function checkOperator(operator, value, isDate) {
  switch (operator) {
    case 'gt': 
      return { $gt: isDate ? moment(value).endOf('day') : value }

    case 'gte': 
      return { $gte: isDate ? moment(value).startOf('day') : value }

    case 'lt': 
      return { $lt: isDate ? moment(value).startOf('day') : value }

    case 'lte': 
      return { $lte: isDate ? moment(value).endOf('day') : value }

    case 'neq': 
      return { $ne: setFilter }

    case 'eq':
      return isDate 
        ? { $gte: new RegExp(moment(value).startOf('day')), $lte: new RegExp(moment(value).endOf('day')) } 
        : value

    case 'isnull': 
      return null

    case 'contains':
      return new RegExp(value, 'i')
    
    case 'doesnotcontain':
      return new RegExp(`^((?!${value}).)*$`)
    
    case 'startswith':
      return new RegExp(`^${value}`)

    case 'endswith':
      return new RegExp(`${value}$`)

    default: {
      return value
    }
  }
}

export const checkJSON = (data) => {
  try {
    return JSON.parse(data)
  }
  catch (e) {
    return data
  }
}

export const parseTags = (str) => {
  const tagslistarr = str.split(' ')
  let moneytags = []
  let usertags = []
  tagslistarr.forEach((tag, key) => {
    if (tagslistarr[key].indexOf('$') == 0) {
      moneytags.push(tagslistarr[key])
    }
    if (tagslistarr[key].indexOf('@') == 0) {
      usertags.push(tagslistarr[key])
    }
  })
  return {moneytags, usertags}
}


export function parseCookies(cookies) {
  const list = {}
  cookies && cookies.split(';').forEach(cookie => {
      const parts = cookie.split('=')
      list[parts.shift().trim()] = decodeURI(parts.join('='))
  })

  return list
}

export async function checkAccess(access, accessCustom, owners, client) {
  const promises = owners.map(owner => UserDataController.read({_id: owner._id}))
  const ownerRecords = await Promise.all(promises)
  const contactsData = ownerRecords.map(owner => owner.contacts.map(contact => contact._id.toString()))
  const contactsIds = [].concat(...contactsData)
  const isOwner = !!owners.find(owner => owner._id == client)
  const isContact = contactsIds.includes(client)
  const isContactCustom = !!accessCustom.map(access => access._id.toString()).find(id => id == client)
  const isContacts = access.includes('contacts')
  const isPrivate = access.includes('private')
  const isCustom = access.includes('custom')
  let allowAccess = access.includes('public')
  if (isPrivate) allowAccess = isOwner
  if (isContacts) allowAccess = isOwner || isContact
  if (isCustom) allowAccess = isOwner || isContactCustom
  return allowAccess
}