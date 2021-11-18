'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const bcrypt = require('bcrypt');

// Construct a router instance
const router = express.Router();

// User route that returns all properties and values for currently authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = await User.findOne({
    where: { id: req.currentUser.id },
    attributes: { exclude: ['password', 'createdAt', 'updatedAt']}
  });
  res.status(200).json({user});
}));

// User route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
  try {
      const user = await User.build(req.body);
      if (user.password) {
          user.password = bcrypt.hashSync(user.password, 10);
      }
      await user.save();
      res.status(201).location('/').end();
  } catch (error) {
      console.log('error name: '+ error.name);
      if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
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

// Course route that returns corresponding course
router.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findOne({
      where: {id: req.params.id},
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [ { 
          model: User, 
          as: 'user', 
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] } 
      } ]
  });
  res.json({ course });
}));

// Course route that creates a new course
router.post('/courses', authenticateUser, asyncHandler(async(req, res) => {
  try {
      const course = await Course.create(req.body);
      res.status(201).location(`/courses/${course.id}`).end();
  } catch (error) {
      if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
      } else {
          throw error;
      }
  }
}));

// Course route that updates the corresponding course
router.put('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  try {
      const course = await Course.findByPk(req.params.id);
      const user = req.currentUser;
      if (user.id === course.userId) {
          if (course) {
              course.title = req.body.title;
              course.description = req.body.description;
              course.estimatedTime = req.body.estimatedTime;
              course.materialsNeeded = req.body.materialsNeeded;
              await course.save();
              await Course.update({ course }, { where: { id: req.params.id } });
              res.status(204).end();
          } else {
              res.status(404).json({ message: 'No course to update.' });
          }
      } else {
          res.status(403).json({ message: 'Only course owner can edit.' });
      }
  } catch (error) {
      if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });   
      } else {
          throw error;
      }
  }
}));

// Course route that deletes the corresponding route
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id);
  const user = req.currentUser;
  if (user.id === course.userId) {
      if (course) {
          await Course.destroy({ where: { id: req.params.id } });
          res.status(204).end();
      } else {
          res.status(404).json({ message: 'No course to delete' } )
      }
  } else {
      res.status(403).json({ message: 'Only course owner can delete.' });
  }
}));

module.exports = router;
