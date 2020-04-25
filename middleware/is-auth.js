const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const fullToken = req.get('Authorization');

        if (!fullToken) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw(error);
        }

        const token = fullToken.split(' ')[1];
        let decodedToken = jwt.verify(token, 'secret');

        if (!decodedToken) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw(error);
        }

        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}