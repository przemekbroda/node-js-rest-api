const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [
    body('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom(async (value, { req }) =>  {
            const user = await User.findOne({email: value}).exec();
            if (user) {
                return Promise.reject('E-Mail address already exists');
            } else {
                return Promise.resolve();
            }
        })
    ,
    body('password')
        .trim()
        .isLength({min: 5,})
    ,
    body('name')
    .trim()
    .notEmpty()
], authController.signup);

module.exports = router;