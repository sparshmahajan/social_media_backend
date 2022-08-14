const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multer');

const { createPost, getPostById, getPublicPosts, updatePost, deletePost, addLike, addComment, getUsersWhoLikedPost, getComments, getRandomPost, removeLike, removeComment } = require('../controllers/posts.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/create', authMiddleware, upload.single('content'), createPost);
router.get('/:postId', authMiddleware, getPostById);
router.get('/get/public', authMiddleware, getPublicPosts);
router.put('/:postId', authMiddleware, updatePost);
router.delete('/:postId', authMiddleware, deletePost);
router.post('/:postId/like', authMiddleware, addLike);
router.post('/:postId/comment', authMiddleware, addComment);
router.get('/:postId/likes', authMiddleware, getUsersWhoLikedPost);
router.get('/:postId/comments', authMiddleware, getComments);
router.get('/get/random', authMiddleware, getRandomPost);
router.delete('/:postId/like', authMiddleware, removeLike);
router.delete('/:postId/comment', authMiddleware, removeComment);

module.exports = router;