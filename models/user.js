'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  usertype: {
    type: [{
      type: String,
      enum: ['User', 'Admin']
    }],
    default: ['User']
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true});


const User = module.exports = mongoose.model('User', UserSchema);
