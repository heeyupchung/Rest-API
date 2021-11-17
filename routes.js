'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance
const router = express.Router();

// User route that returns all properties and values for currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.status(200).json(user);
}));

// User route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
    await User.create(req.body);
    res.status(201).json({ "message": "Account successfully created!" });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
}));

// Course route that returns all courses
router.get('/courses', asyncHandler(async (req, res) => {
  // "return all courses including the User associated with each course"...?
  const courses = await Course.findAll();
  res.status(200).json(courses);
}));

// Course route that returns corresponding courses with :id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (course) {
    res.status(200).json(course);
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "Looks like that book doesn't exist.";
    next(err);
  }
}));

// Course route that creates new course
router.post('/courses/', asyncHandler(async (req, res) => {
  const course = await Course.create(req.params.id);
  if (course) {
    res.status(200).json(course);
  }
}));



module.exports = router;
