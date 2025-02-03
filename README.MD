# Cost Manager RESTful Web Services

## Overview
The Cost Manager project is a RESTful web service designed for managing personal expenses. It enables users to add and categorize expenses, generate monthly reports, and retrieve user details. The backend is developed using **Express.js** and **Mongoose**, with **MongoDB Atlas** as the database solution.

## Table of Contents
- [Tools](#tools)
- [Database Structure](#database-structure)
- [Endpoints](#endpoints)
    - [Add Cost Item](#add-cost-item)
    - [Get Monthly Report](#get-monthly-report)
    - [Get User Details](#get-user-details)
    - [Get Developers Team](#get-developers-team)
- [Unit Tests](#unit-tests)
- [Code Style](#code-style)


## Tools
The following tools are required for development and collaboration:
- **Slack** (or an alternative) for team communication.
- **Jira** (or an alternative) for issue tracking.
- **Code with Me** (or an alternative) for remote collaboration.
- **JSDoc** for documentation.

## Database Structure
The database is hosted on **MongoDB Atlas** and follows the **computed pattern**. The main collections are:

### Users Collection
```json
{
  "id": 123123,
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1990-01-01",
  "marital_status": "single"
}
```

### Costs Collection
```json
{
  "description": "Groceries",
  "category": "food",
  "userid": 123123,
  "sum": 50
}
```

Supported categories: **food, health, housing, sport, education**.

## Endpoints
### Add Cost Item
- **Endpoint:** `/api/add`
- **Method:** `POST`
- **Required Parameters:** `description, category, userid, sum`
- **Response:** JSON document with the added cost item.

### Get Monthly Report
- **Endpoint:** `/api/report`
- **Method:** `GET`
- **Required Parameters:** `id, year, month`
- **Response:** JSON document with costs grouped by categories.

Example response:
```json
{
  "userid": 123123,
  "year": 2025,
  "month": 11,
  "costs": {
    "food": [{ "sum": 12, "description": "choco", "day": 17 }],
    "education": [{ "sum": 82, "description": "math book", "day": 10 }]
  }
}
```

### Get User Details
- **Endpoint:** `/api/users/:id`
- **Method:** `GET`
- **Response:** JSON document containing `first_name, last_name, id, total`.

### Get Developers Team
- **Endpoint:** `/api/about`
- **Method:** `GET`
- **Response:** JSON document with first and last names of the development team members.

## Unit Tests
Unit tests are implemented for all endpoints using a chosen testing framework.

## Code Style
Follow the [JavaScript Style Guide](http://www.abelski.com/courses/stylejs/languagerules.pdf) and [JavaScript Code Formatting](http://www.abelski.com/courses/stylejs/stylerules.pdf).

