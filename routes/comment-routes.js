// routes/comment-routes.js
// Handles all API endpoints related to comments.

// Create Express router for comment-specific routes.
const router = require('express').Router();
// Import Comment model to interact with the comments table.
const { Comment } = require('../models');
// Import authentication middleware to protect routes.
const { authMiddleware } = require('../utils/auth');

// POST /api/comments - Create a new comment (Requires Authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Get the user ID from the JWT payload. The `authMiddleware` adds the user ID to the request object.
    const user_id = req.user.id;
    // Get comment text and the post ID from request body
    const { comment_text, post_id } = req.body;

    // Confirm  both `comment_text` and `post_id` are provided (required fields).
    if (!comment_text || !post_id) {
      // If not, return a 400 status (Bad Request)
      return res.status(400).json({ message: 'Comment text and post ID are required.' });
    }

    // Create the new comment in the Db
    const newComment = await Comment.create({
      comment_text,
      post_id,
      user_id,  // ID of the authenticated user associated with the comment.
    });
    // If comment successfully created, return 201 (Created) status.
    res.status(201).json({ message: 'Comment created successfully.', comment: newComment });
  } catch (err) {
    // Catch all unanticipated errors
    console.error('Error creating comment:', err);
    res.status(500).json({ message: 'Failed to create comment.', error: err.message });
  }
});

// PUT /api/comments/:id - Update an existing comment (Requires Authentication and Ownership)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Get the comment ID from the URL parameter and the user ID from the JWT payload
    const commentId = req.params.id;
    const userId = req.user.id;
    const { comment_text } = req.body;

    // Find the comment to ensure it exists and is owned by the authenticated user
    const comment = await Comment.findOne({
      where: {
        id: commentId,
        user_id: userId, // Only the owner can update the comment
      },
    });
    // If no comment found with provided ID and user ID: comment does not exist or the user does not own it.
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to update it.' });
    }
    // Else: update `comment_text` and return 200 (OK) status.
    const updatedComment = await comment.update({ comment_text });
    res.status(200).json({ message: 'Comment updated successfully.', comment: updatedComment });
  } catch (err) {
    // Catch all unanticipated errors
    console.error('Error updating comment:', err);
    res.status(500).json({ message: 'Failed to update comment.', error: err.message });
  }
});

// DELETE /api/comments/:id - Delete a comment (Requires Authentication and Ownership)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Get the comment ID from the URL parameter and the user ID from the JWT payload
    const commentId = req.params.id;
    const userId = req.user.id;

    // Delete the comment, if it belongs to the user
    const deletedCount = await Comment.destroy({
      where: {
        id: commentId,
        user_id: userId, // Only the owner can delete the comment
      },
    });
    // If: `deletedCount` is 0, the comment was not found or the user did not own it.
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to delete it.' });
    }
    // Else: successful, return 200 (OK) status, and msg.
    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment.', error: err.message });
  }
});
// Export router for use in `routes/index.js`.
module.exports = router;
