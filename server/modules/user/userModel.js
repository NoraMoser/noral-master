import mongoose from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import generatePassword from 'generate-password';
import owasp from 'owasp-password-strength-test';

const Schema = mongoose.Schema;

// Your user schema here...

mongoose.model('User', UserSchema); // Register the User model
