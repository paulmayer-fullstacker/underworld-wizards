// routes/like-routes.js
// Dedicated API endpoints for liking and unliking a post.
const router = require('express').Router();
const { Like } = require('../models');
const { authMiddleware } = require('../utils/auth');

// POST /api/likes - Allows a logged-in user to like a post
router.post('/', authMiddleware, async (req, res) => {
  try {
    // req.user is populated by authMiddleware from the JWT payload
    const userId = req.user.id; 
    const { post_id } = req.body;

    if (!post_id) {
      return res.status(400).json({ message: 'post_id is required in the request body.' });
    }

    // Try to find an existing like by this user on this post
    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        post_id: post_id,
      }
    });

    if (existingLike) {
      // If a like already exists, return an error to prevent duplicates
      return res.status(400).json({ message: 'You have already liked this post.' });
    }

    // Create the new like record in the database
    const newLike = await Like.create({
      user_id: userId,
      post_id: post_id,
    });

    res.status(201).json({message: 'Post liked successfully!', like: newLike}); // 201 Created
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: 'Failed to like post.', error: err.message });
  }
});

// DELETE /api/likes/:id - Allows a logged-in user to unlike a post
// The id parameter here is the post_id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    // Find and delete the like record that matches both the user and the post
    const deletedCount = await Like.destroy({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (deletedCount === 0) {
      // If no records were deleted, it means the like didn't exist or wasn't from this user
      return res.status(404).json({ message: 'No like found for this post from your account.' });
    }

    res.status(200).json({ message: 'Post unliked successfully!' });
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({ message: 'Failed to unlike post.', error: err.message });
  }
});

module.exports = router;
