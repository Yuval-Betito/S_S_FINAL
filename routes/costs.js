/**
 * @fileoverview Defines the routes for managing cost items in the Cost Manager project.
 * This module provides endpoints for adding a new cost item and retrieving a monthly report
 * of cost items for a specific user. The report groups cost items by predefined categories.
 *
 * @module routes/costs
 */

const express = require('express');
const router = express.Router();
const Cost = require('../models/cost');
const User = require('../models/user');

/**
 * POST /api/add
 * Adds a new cost item.
 *
 * Required fields (in the request body):
 * - description {string}: A brief description of the cost.
 * - category {string}: The category of the cost. Allowed values: 'food', 'health', 'housing', 'sport', 'education'.
 * - userid {string}: The ID of the user who is adding the cost.
 * - sum {number}: The amount of the cost (must be a positive number).
 *
 * Optional field:
 * - date {string|Date}: The date the cost was created. If not provided, the current date/time is used.
 *
 * @name POST /api/add
 * @function
 * @memberof module:routes/costs
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.description - The description of the cost.
 * @param {string} req.body.category - The category of the cost.
 * @param {string} req.body.userid - The user ID.
 * @param {number} req.body.sum - The cost amount.
 * @param {string|Date} [req.body.date] - The date of the cost.
 * @param {Object} res - The Express response object.
 * @returns {void} Sends a JSON response containing the newly created cost item, or an error message.
 */
router.post('/add', async (req, res) => {
  try {
    const { description, category, userid, sum, date } = req.body;

    // Validate mandatory fields
    if (!description || !category || !userid || sum === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (sum <= 0) {
      return res.status(400).json({ error: 'Sum must be a positive number' });
    }

    // Check that the user exists
    const userExists = await User.findOne({ id: userid });
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the cost item (use provided date or current date)
    const newCost = new Cost({
      description,
      category,
      userid,
      sum,
      date: date ? new Date(date) : Date.now()
    });
    await newCost.save();
    res.status(201).json(newCost);
  } catch (error) {
    console.error('Error adding cost:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/report
 * Retrieves a monthly report for a specific user.
 *
 * Required query parameters:
 * - id {string}: The ID of the user.
 * - year {number|string}: The year for which the report is generated.
 * - month {number|string}: The month (1-12) for which the report is generated.
 *
 * The report groups cost items by category (food, health, housing, sport, education).
 * Each cost item in the report includes the sum, description, and the day of the month.
 *
 * @name GET /api/report
 * @function
 * @memberof module:routes/costs
 * @param {Object} req - The Express request object.
 * @param {Object} req.query - The query parameters.
 * @param {string} req.query.id - The user ID.
 * @param {number|string} req.query.year - The report year.
 * @param {number|string} req.query.month - The report month.
 * @param {Object} res - The Express response object.
 * @returns {void} Sends a JSON response containing the monthly report,
 * or an error message if required parameters are missing or invalid.
 */
router.get('/report', async (req, res) => {
  try {
    const { id, year, month } = req.query;

    if (!id || !year || !month) {
      return res.status(400).json({ error: 'Missing parameters: id, year, month' });
    }

    const parsedYear = parseInt(year, 10);
    const parsedMonth = parseInt(month, 10);
    if (isNaN(parsedYear) || isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ error: 'Invalid year or month' });
    }

    // Calculate the first and last date of the month
    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    // Using 0 as day gives the last day of the previous month; so for the last day of the month, we:
    const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

    // Retrieve cost items for the user within the date range
    const costs = await Cost.find({
      userid: id,
      date: { $gte: startDate, $lte: endDate }
    });

    if (costs.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified user and date range' });
    }

    // Group costs by category (ensuring all supported categories appear even if empty)
    const grouped = {
      food: [],
      health: [],
      housing: [],
      sport: [],
      education: []
    };

    costs.forEach(cost => {
      // Extract the day from the date
      const day = new Date(cost.date).getDate();
      const costItem = { sum: cost.sum, description: cost.description, day };
      if (grouped[cost.category]) {
        grouped[cost.category].push(costItem);
      } else {
        // In case a cost has a non-supported category (should not happen as we use enum)
        grouped[cost.category] = [costItem];
      }
    });

    // Build the report object in the requested format
    const report = {
      userid: id,
      year: parsedYear,
      month: parsedMonth,
      costs: []
    };

    ['food', 'health', 'housing', 'sport', 'education'].forEach(category => {
      report.costs.push({ [category]: grouped[category] || [] });
    });

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
