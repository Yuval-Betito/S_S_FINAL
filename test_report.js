#!/usr/bin/env node
/**
 * @fileoverview This script tests the Report model for the Cost Manager project.
 * It connects to MongoDB, creates a sample report, saves it, fetches it, and then deletes it.
 * The script logs the results to the console.
 *
 * Usage:
 *   Run the script with Node.js:
 *     $ node test_report.js
 *
 * Note: Ensure that the .env file contains the correct MONGO_URI.
 *
 * @module testReport
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import the Report model
const Report = require('./models/Report');

/**
 * Connects to MongoDB and then runs the report model test.
 * Exits the process if the connection fails.
 */
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB for testing Report model');
    runTest();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

/**
 * Runs the test for the Report model.
 * It creates a sample report, saves it to the database, fetches it to verify,
 * and then deletes it. Finally, the MongoDB connection is closed.
 *
 * @async
 * @function runTest
 */
async function runTest() {
  try {
    // Define sample report data
    const reportData = {
      userid: "123123",
      year: 2025,
      month: 2,
      data: [
        {
          food: [
            { sum: 10, description: "cost one", day: 1 },
            { sum: 20, description: "cost two", day: 1 }
          ]
        },
        { health: [] },
        { housing: [] },
        { sport: [] },
        { education: [] }
      ]
    };

    // Create a new Report instance with the sample data
    const newReport = new Report(reportData);

    // Save the report to the database
    const savedReport = await newReport.save();
    console.log("Report saved successfully:", savedReport);

    // Fetch the saved report based on userid, year, and month
    const fetchedReport = await Report.findOne({ userid: "123123", year: 2025, month: 2 });
    console.log("Fetched Report:", fetchedReport);

    // Delete the report (cleanup)
    await Report.deleteOne({ _id: savedReport._id });
    console.log("Report deleted successfully.");

    // Close the MongoDB connection
    mongoose.connection.close();
  } catch (error) {
    console.error("Error during Report model test:", error);
    mongoose.connection.close();
  }
}
