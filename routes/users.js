/**
 * @fileoverview Defines routes for managing user-related API requests.
 * This module provides endpoints for adding a new user and retrieving a user's details along with their total cost.
 *
 * @module routes/users
 */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Cost = require('../models/cost');

/**
 * POST /api/users/add
 * Adds a new user to the database.
 *
 * Required fields (in the request body):
 *   - id {string}: The unique identifier for the user.
 *   - first_name {string}: The first name of the user.
 *   - last_name {string}: The last name of the user.
 *   - birthday {Date|string}: The user's birthday.
 *   - marital_status {string}: The user's marital status. Allowed values: 'single', 'married', 'divorced', 'widowed'.
 *
 * @name POST /api/users/add
 * @function
 * @memberof module:routes/users
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing user data.
 * @param {Object} res - The Express response object.
 * @returns {void} Returns a JSON response with the newly created user object if successful,
 *                 or an error message with appropriate HTTP status code.
 */
router.post('/add', async (req, res) => {
  try {
    const { id, first_name, last_name, birthday, marital_status } = req.body;
    if (!id || !first_name || !last_name || !birthday || !marital_status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newUser = new User({
      id,
      first_name,
      last_name,
      birthday,
      marital_status
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'User ID already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /api/users/:id
 * Retrieves the details of a specific user along with their total cost from cost items.
 *
 * The response contains the following properties:
 *   - id {string}: The user's unique identifier.
 *   - first_name {string}: The user's first name.
 *   - last_name {string}: The user's last name.
 *   - total {number}: The total cost sum aggregated from the user's cost items.
 *
 * @name GET /api/users/:id
 * @function
 * @memberof module:routes/users
 * @param {Object} req - The Express request object.
 * @param {string} req.params.id - The ID of the user to retrieve.
 * @param {Object} res - The Express response object.
 * @returns {void} Returns a JSON response with the user details and total cost,
 *                 or an error message if the user is not found or if an error occurs.
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total cost using aggregation on the Cost collection
    const totalResult = await Cost.aggregate([
      { $match: { userid: req.params.id } },
      { $group: { _id: null, total: { $sum: '$sum' } } }
    ]);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    res.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      total
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
