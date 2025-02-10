/**
 * @fileoverview Unit tests for the Cost Manager API using Mocha, Chai, and Supertest.
 * This version tests against the deployed backend on Render.
 */

const request = require('supertest');
const chaiImported = require('chai');
const expect = (chaiImported && chaiImported.default && chaiImported.default.expect)
    ? chaiImported.default.expect
    : chaiImported.expect;

const BASE_URL = 'https://cost-manager-backend-x8b9.onrender.com';

describe('Cost Manager API - Cloud Tests', function () {
    /**
     * Tests the GET /api/about endpoint.
     */
    describe('GET /api/about', function () {
        it('should return the team members with first_name and last_name only', function (done) {
            request(BASE_URL)
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
     */
    describe('GET /api/users/:id', function () {
        it('should return the details of the specified user including total cost', function (done) {
            request(BASE_URL)
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
     */
    describe('POST /api/add', function () {
        it('should add a new cost item and return the created cost item', function (done) {
            const costData = {
                userid: "123123",
                description: "test cost item",
                category: "food",
                sum: 15
            };
            request(BASE_URL)
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
     */
    describe('GET /api/report', function () {
        it('should return a monthly report with cost items grouped by category', async function () {
            const res = await request(BASE_URL)
                .get('/api/report')
                .query({ id: "123123", year: "2025", month: "2" })
                .expect(200);

            const report = res.body;
            expect(report).to.have.property('userid', '123123');
            expect(report).to.have.property('year', 2025);
            expect(report).to.have.property('month', 2);
            expect(report).to.have.property('costs').that.is.an('array');
        });
    });
});
