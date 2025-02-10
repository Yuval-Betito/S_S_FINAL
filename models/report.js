/**
 * @fileoverview Defines the schema and model for storing reports in the Cost Manager project.
 * This model can be used to save monthly reports for users.
 *
 * Note: According to the project requirements, the report is computed from the cost items.
 * Therefore, using this model is optional.
 *
 * @module models/Report
 */

const mongoose = require('mongoose');

/**
 * Schema for a report.
 *
 * @typedef {Object} Report
 * @property {String} userid - The ID of the user for whom the report is generated (required).
 * @property {Number} year - The year for the report (required).
 * @property {Number} month - The month for the report (required).
 * @property {Array} data - The array containing the report data (required).
 *        This can include grouped cost items by category.
 * @property {Date} created_at - The date when the report was created. Defaults to the current date/time.
 */
const reportSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    data: {
        type: Array,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Export the Report model based on the reportSchema
module.exports = mongoose.model('Report', reportSchema);
