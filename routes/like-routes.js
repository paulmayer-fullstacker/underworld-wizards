// routes/like-routes.js
// Define API endpoints for managing post likes. It allows authenticated users to "like" and "dislike" posts.
const router = require('express').Router();
const { Like } = require('../models');
const { authMiddleware } = require('../utils/auth');

// POST /api/likes - Allows a logged-in user to like a post
router.post('/', authMiddleware, async (req, res) => {
  try {
    // req.user is populated by authMiddleware from the JWT payload
    const userId = req.user.id;
    // Get `post_id` from request body, which specifies which post the user wants to like.
    const { post_id } = req.body;

    if (!post_id) {
      return res.status(400).json({ message: 'post_id is required in the request body.' });
    }

    // Before creating a new like, try to find an existing like by this user on this post
    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        post_id: post_id,
      }
    });
    // If: `existingLike` found, return a 400 Bad Request status to prevent duplicate likes and msg.
    if (existingLike) {
      // If a like already exists, return an error to prevent duplicates
      return res.status(400).json({ message: 'You have already liked this post.' });
    }
    // Else: create the new like record in the database
    const newLike = await Like.create({
      user_id: userId,
      post_id: post_id,
    });
    // Return 201 (Created) status to indicate that a new resource has been successfully created.
    res.status(201).json({message: 'Post liked successfully!', like: newLike}); // 201 Created
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: 'Failed to like post.', error: err.message });
  }
});

// DELETE /api/likes/:id - Allows a logged-in user to unlike a post. The id parameter here is the post_id
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
    // Else: record was deleted. Return 200 OK status with a success message.
    res.status(200).json({ message: 'Post unliked successfully!' });
  } catch (err) {
    // Catch all other
    console.error('Error unliking post:', err);
    res.status(500).json({ message: 'Failed to unlike post.', error: err.message });
  }
});
// Export the router for use by `routes/index.js` file.
module.exports = router;
