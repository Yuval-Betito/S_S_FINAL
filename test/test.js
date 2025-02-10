/**
 * @fileoverview Unit tests for the Cost Manager API using Mocha, Chai, and Supertest.
 * This file tests the following endpoints:
 *   - GET /api/about: Retrieves team member information.
 *   - GET /api/users/:id: Retrieves details of a specific user along with total cost.
 *   - POST /api/add: Adds a new cost item.
 *   - GET /api/report: Retrieves a monthly report with cost items grouped by category.
 *
 * The tests also handle database setup/cleanup using Mongoose.
 *
 * @module test/test
 */

const request = require('supertest');

// Import Chai for assertions. In case the default property is available (for ESM), use it.
const chaiImported = require('chai');
const expect = (chaiImported && chaiImported.default && chaiImported.default.expect)
  ? chaiImported.default.expect
  : chaiImported.expect;

const mongoose = require('mongoose');
const app = require('../app'); // Ensure that app.js is in CommonJS format (using require and module.exports)

// Import models to clear and seed test data
const User = require('../models/user');
const Cost = require('../models/cost');

describe('Cost Manager API Unit Tests', function () {

  /**
   * Connects to the MongoDB database before running any tests.
   * @function before
   * @param {Function} done - Callback to indicate completion.
   */
  before(function (done) {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => done())
      .catch((err) => done(err));
  });

  /**
   * Cleans the database and inserts a test user before each test.
   * @async
   * @function beforeEach
   */
  beforeEach(async function () {
    await User.deleteMany({});
    await Cost.deleteMany({});

    // Insert a test user as required by the API endpoints.
    const testUser = new User({
      id: "123123",
      first_name: "mosh",
      last_name: "israeli",
      birthday: new Date("1990-01-01"),
      marital_status: "single"
    });
    await testUser.save();
  });

  /**
   * Closes the MongoDB connection after all tests have run.
   * @function after
   * @param {Function} done - Callback to indicate completion.
   */
  after(function (done) {
    mongoose.connection.close()
      .then(() => done())
      .catch((err) => done(err));
  });

  /**
   * Tests the GET /api/about endpoint.
   * Expects the response to be an array of team members with "first_name" and "last_name" properties.
   */
  describe('GET /api/about', function () {
    it('should return the team members with first_name and last_name only', function (done) {
      request(app)
        .get('/api/about')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('array').that.is.not.empty;
          res.body.forEach(member => {
            expect(member).to.have.property('first_name');
            expect(member).to.have.property('last_name');
          });
          done();
        });
    });
  });

  /**
   * Tests the GET /api/users/:id endpoint.
   * Expects the response to include the user's id, first_name, last_name, and total cost.
   */
  describe('GET /api/users/:id', function () {
    it('should return the details of the specified user including total cost', function (done) {
      request(app)
        .get('/api/users/123123')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('id', '123123');
          expect(res.body).to.have.property('first_name', 'mosh');
          expect(res.body).to.have.property('last_name', 'israeli');
          expect(res.body).to.have.property('total');
          done();
        });
    });
  });

  /**
   * Tests the POST /api/add endpoint.
   * Expects to add a new cost item and receive the created item in the response.
   *
   * Required fields in the request body:
   *   - userid: "123123"
   *   - description: "test cost item"
   *   - category: "food"
   *   - sum: 15
   */
  describe('POST /api/add', function () {
    it('should add a new cost item and return the created cost item', function (done) {
      const costData = {
        userid: "123123",
        description: "test cost item",
        category: "food",
        sum: 15
      };
      request(app)
        .post('/api/add')
        .send(costData)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('description', costData.description);
          expect(res.body).to.have.property('category', costData.category);
          expect(res.body).to.have.property('userid', costData.userid);
          expect(res.body).to.have.property('sum', costData.sum);
          expect(res.body).to.have.property('date');
          done();
        });
    });
  });

  /**
   * Tests the GET /api/report endpoint.
   * First, adds two cost items. Then, requests a monthly report for the test user.
   * Expects the report to include the cost items grouped by category.
   */
  describe('GET /api/report', function () {
    it('should return a monthly report with cost items grouped by category', async function () {
      // Add two cost items as sample data.
      const cost1 = { userid: "123123", description: "cost one", category: "food", sum: 10 };
      const cost2 = { userid: "123123", description: "cost two", category: "food", sum: 20 };

      await request(app).post('/api/add').send(cost1).expect(201);
      await request(app).post('/api/add').send(cost2).expect(201);

      // Request the report for user 123123 for year 2025 and month 2.
      const res = await request(app)
        .get('/api/report')
        .query({ id: "123123", year: "2025", month: "2" })
        .expect(200);

      const report = res.body;
      expect(report).to.have.property('userid', '123123');
      expect(report).to.have.property('year', 2025);
      expect(report).to.have.property('month', 2);
      expect(report).to.have.property('costs').that.is.an('array');

      // Verify that the "food" category includes the two cost items.
      const foodCategory = report.costs.find(item => item.food);
      expect(foodCategory).to.exist;
      expect(foodCategory.food).to.be.an('array').with.lengthOf(2);
      // Verify the total cost in the "food" category is equal to 30.
      const totalFoodCost = foodCategory.food.reduce((sum, item) => sum + item.sum, 0);
      expect(totalFoodCost).to.equal(30);
    });
  });

});
