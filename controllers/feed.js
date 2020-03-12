const { validationResult } = require('express-validator');
const Post = require('../models/post');
const Path = require('path');
const fs = require('fs');

exports.getPosts = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const perPage = 2;

        const totalItems = await Post.find().count().exec();

        const posts = await Post.find().skip((page - 1) * perPage).limit(perPage).exec();
        res.status(200).json({
            posts: posts,
            totalItems: totalItems
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, entered data is incorrect');
            error.statusCode = 422;
            throw error;
        }

        if (!req.file) {
            const error = new Error('No image provided');
            error.statusCode = 422;
            throw error;
        }

        console.log(req.file);
        

        const imageUrl = req.file.path;
        const title = req.body.title;
        const content = req.body.content;
        
        let post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: {
                name: 'Przemek'
            }
        });

        post = await post.save()

        return res.status(201).json({
            message: 'Post created successfully',
            post: post
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).exec();
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw(error);
        }

        res.status(200).json({
            message: 'Post fetched',
            post: post
        })

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }

}

exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const title = req.body.title;
        const content = req.body.content;
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            imageUrl = req.file.path;
        }

        if (!imageUrl) {
            const error = new Error('No file picked');
            error.statusCode = 422;
            throw(error);
        }

        const post = await Post.findById(postId).exec();
        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw(error);
        }

        clearImage(imageUrl);

        if (imageUrl !== post.imageUrl) {
            clearImage(imageUrl);
        }
        
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;

        const updatedPost = await post.save();
        res.status(200).json({post: updatedPost});
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).exec();

        if (!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw(error);
        }

        clearImage(post.imageUrl);

        const deletedPost = await post.remove();
        
        res.status(200).json({
            message: 'Post deleted',
            post: {
                postId: deletedPost._id
            }
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500
        }
        next(error);
    }
}

const clearImage = filePath => {
    const path = Path.join(__dirname, '..', filePath);
    fs.unlink(path, (err) => {
        console.log(err);
    });
}