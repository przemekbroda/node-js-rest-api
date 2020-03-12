const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

router.put('/signup', [
    body('email')
    .normalizeEmail()
    .isEmail(),
    body('password')
    .trim()
    .isLength({
        min: 6,
        max: 24
    }),
    body('name')
    .trim()
]);

module.exports = router;