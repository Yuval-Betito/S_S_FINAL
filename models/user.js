/**
 * @fileoverview Defines the schema and model for a User in the Cost Manager project.
 * This model is used to store user information in the MongoDB database.
 *
 * Each user document contains a unique ID, first name, last name, birthday,
 * marital status, and the creation date of the record.
 *
 * @module models/User
 */

const mongoose = require('mongoose');

/**
 * Schema for a User.
 *
 * @typedef {Object} User
 * @property {string} id - The unique identifier for the user (required).
 * @property {string} first_name - The first name of the user (required, minimum 2 characters).
 * @property {string} last_name - The last name of the user (required, minimum 2 characters).
 * @property {Date} birthday - The user's birthday (required).
 * @property {string} marital_status - The user's marital status (required).
 *         Allowed values are: 'single', 'married', 'divorced', 'widowed'.
 * @property {Date} created_at - The date when the user record was created.
 *         Defaults to the current date/time if not provided.
 */
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true,
    minlength: 2
  },
  last_name: {
    type: String,
    required: true,
    minlength: 2
  },
  birthday: {
    type: Date,
    required: true
  },
  marital_status: {
    type: String,
    required: true,
    enum: ['single', 'married', 'divorced', 'widowed']
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Export the User model based on the userSchema
module.exports = mongoose.model('User', userSchema);
