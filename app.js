const express = require('express');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const urls = require('./private/urls');
const multer = require('multer'); //used for file upload
const cors = require('cors');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {        
        cb(null, new Date().getTime().toString() + '-' + file.originalname);
    },
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpge') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(cors());
app.use(bodyParser.json());

app.use(multer({storage: fileStorage,}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res ,next) => {
    console.log(error);
    const status = error.statusCode;
    const message = error.message;
    const data = error.data;

    res.status(status).json({
        message: message,
        data: data
    });
})

mongoose.connect(urls.mongodbUrl, {useUnifiedTopology: true, useNewUrlParser: true}, (err) => {
    if (err) {
        console.log(err);
    }
})
app.listen(8080, () => {
    console.log('SERVER STARTING');
});