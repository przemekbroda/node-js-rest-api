const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password= req.body.password;
        const name = req.body.name;
    
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.data = errors.array();
            throw(error);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const createdUser = new User({
            email: email,
            password: hashedPassword,
            name: name,
        });

        const savedUser = await createdUser.save();

        res.status(200).json({
            message: 'User created',
            userId: savedUser._id
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }

}

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email: email}).exec();
        if (!user) {
            const error = new Error('Wrong credentials');
            error.statusCode = 401;
            throw(error);
        }

        const isSame = await bcrypt.compare(password, user.password);
        if (!isSame) {
            const error = new Error('Wrong credentials');
            error.statusCode = 401;
            throw(error);
        }

        const token = jwt.sign({email: user.email, userId: user._id.toString()}, 'secret', {expiresIn: '1h'});

        res.status(200).json({
            token: token,
            userId: user._id.toString()
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}