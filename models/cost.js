/**
 * @fileoverview Defines the schema and model for cost items in the Cost Manager project.
 * This model is used to store individual cost entries in the MongoDB database.
 *
 * Each cost item includes a description, a category (restricted to specific values),
 * the ID of the user who created the cost, the sum (amount) of the cost,
 * and the date when the cost was created (defaulting to the current date/time if not provided).
 *
 * @module models/Cost
 */

const mongoose = require('mongoose');

/**
 * Schema for a cost item.
 *
 * @typedef {Object} Cost
 * @property {String} description - A brief description of the cost (required).
 * @property {String} category - The category of the cost (required). Allowed values are:
 *   'food', 'health', 'housing', 'sport', 'education'.
 * @property {String} userid - The ID of the user associated with this cost (required).
 * @property {Number} sum - The numerical value of the cost (required).
 * @property {Date} date - The date when the cost was created. Defaults to the current date/time if not provided.
 */
const costSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'health', 'housing', 'sport', 'education']
  },
  userid: {
    type: String,
    required: true
  },
  sum: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Export the Cost model based on the costSchema
module.exports = mongoose.model('Cost', costSchema);
