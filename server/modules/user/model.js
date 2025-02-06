import mongoose from 'mongoose'
import crypto from 'crypto'
import validator from 'validator'
import generatePassword from 'generate-password'
import owasp from 'owasp-password-strength-test'
const Schema = mongoose.Schema
const validFileTypes = ['.jpg, .jpeg, .png']

/**
 * A Validation function for local strategy properties
 */
const validateProperty = (property) => {
  return property.length > 0
}

/**
 * A Validation function for local strategy email
 */
const validateEmail = (email) => {
  return validator.isEmail(email, { require_tld: false })
}

/**
 * User Schema
 */
const UserSchema = new Schema({

  /* Identification */
  firstName: {
    type: String,
    trim: true,
    label: 'First name',
    required: 'Please fill in your first name',
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    label: 'Last name',
    required: 'Please fill in your last name',
    default: ''
  },
  displayName: {
    type: String,
    trim: true,
    default: ''
  },
  username: {
    type: String,
    unique: 'Username already exists',
    label: 'Create a username',
    required: 'Please fill in a username',
    lowercase: true,
    trim: true
  },
  profileImage: {
    type: Schema.ObjectId,
    ref: 'File',
    label: 'Profile image',
    inputType: 'file',
    defaultImage: 'user',
    accept: ['.jpg, .jpeg, .png'],
    avatar: true,
    default: null
  },

  /* Point of contact */
  email: {
    type: String,
    unique: 'An account with this email address already exists',
    lowercase: true,
    trim: true,
    label: 'Email address',
    required: 'Please fill in your email address',
    validation: ['email'],
    validate: [validateEmail, 'Please fill a valid email address'],
    default: ''
  },

  /* Permissions */
  allowNotifications: {
    type: Array,
    default: ['email']
  },
  
  /* Work related */
  jobTitle: {
    type: String,
    trim: true,
    label: 'Job title',
    default: ''
  },
  headline: {
    type: String,
    trim: true,
    label: 'Headline',
    default: ''
  },
  enterprise: {
    type: Schema.ObjectId,
    ref: 'Enterprise'
  },

  /* Security */
  requireChangePassword: {
    type: Boolean,
    label: 'Require password change',
    default: false
  },
  password: {
    type: String,
    label: 'Create a password',
    inputType: 'password',
    required: 'Please create a password',
    validation: ['password']
  },
  salt: {
    type: String
  },
  verification: {
    type: [{
      type: String,
      enum: ['email', 'mobile']
    }],
    label: 'Verified',
    inputType: 'checkbox',
    default: []
  },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin', 'superadmin']
    }],
    label: 'Access roles',
    inputType: 'checkbox',
    default: ['user']
  },
  contacts: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  // requests: [{
  //   type: Schema.ObjectId,
  //   ref: 'Request'
  // }],
  // notifications: [{
  //   type: Schema.ObjectId,
  //   ref: 'Notification'
  // }],
  sessionId: {
    type: String,
    default: ''
  },
  lastModifiedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  lastModifiedDate: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For account verification */
  accountVerificationToken: {
    type: String
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
})

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64')
    this.password = this.hashPassword(this.password)
  }
  next()
})

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function (next) {
  if (this.password && this.isModified('password')) {
    const result = owasp.test(this.password)
    if (result.errors.length) {
      const error = result.errors.join(' ')
      this.invalidate('password', error)
    }
  }
  next()
})

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer.from(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64')
  } else {
    return password
  }
}

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password)
}

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = async function (username, suffix, callback) {
  const possibleUsername = username.toLowerCase() + (suffix || '')
  try {
    const user = await this.findOne({ username: possibleUsername })
    if (!user) {
      callback(possibleUsername)
    } else {
      return this.findUniqueUsername(username, (suffix || 0) + 1, callback)
    }
  } catch (e) {
    callback(null)
  }
}

/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
UserSchema.statics.generateRandomPassphrase = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let password = ''
      const repeatingCharacters = new RegExp('(.)\\1{2,}', 'g')
      
      // iterate until the we have a valid passphrase
      // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
      while (password.length < 20 || repeatingCharacters.test(password)) {
        // build the random password
        password = generatePassword.generate({
          length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
          numbers: true,
          symbols: false,
          uppercase: true,
          excludeSimilarCharacters: true
        })
  
        // check if we need to remove any repeating characters
        password = password.replace(repeatingCharacters, '')
      }
  
      // Send the rejection back if the passphrase fails to pass the strength test
      if (owasp.test(password).errors.length) {
        reject(new Error('An unexpected problem occured while generating the random passphrase'))
      } else {
        // resolve with the validated passphrase
        resolve(password)
      }
    } catch (e) {
      reject(new Error(e))
    }
  })
}

mongoose.model('User', UserSchema)