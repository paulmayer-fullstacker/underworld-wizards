// // routes/api/comment-routes.js
// const router = require('express').Router();
// const { Comment, User } = require('../models'); 
// const { authMiddleware } = require('../utils/auth'); 

// // GET comments 
// router.get('/', async (req, res) => {
//   try {
//     const comments = await Comment.findAll({
//       attributes: ['id', 'comment_text', 'createdAt'],
//       include: [
//         {
//           model: User, // Include the user who made the comment
//           attributes: ['username']
//         }
//       ]
//     });
//     res.status(200).json(comments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to retrieve comments', error: err.message });
//   }
// });

// // POST /api/comments - Create a new comment
// router.post('/', authMiddleware, async (req, res) => {
//   try {
//     if (!req.body.comment_text || !req.body.post_id) {
//       return res.status(400).json({ message: 'Comment text and post ID are required.' });
//     }
//     // Create the new comment in the database
//     const newComment = await Comment.create({
//       comment_text: req.body.comment_text,
//       post_id: req.body.post_id,
//       user_id: req.user.id, 
//     });
//     // Send back the newly created comment, and success message
//     res.status(200).json(newComment);

//   } catch (err) {
//     console.error('Error creating comment:', err);
//     if (err.name === 'SequelizeValidationError') {
//         return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
//     }
//     res.status(500).json({ message: 'Failed to create comment', error: err.message });
//   }
// });

// module.exports = router;

// routes/comment-routes.js
const router = require('express').Router();
const { Comment } = require('../models');
const { authMiddleware } = require('../utils/auth');

// POST /api/comments - Create a new comment (Requires Authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Get the user ID from the JWT payload
    const user_id = req.user.id;
    const { comment_text, post_id } = req.body;

    // Validate that required fields are present
    if (!comment_text || !post_id) {
      return res.status(400).json({ message: 'Comment text and post ID are required.' });
    }

    // Create the new comment in the database
    const newComment = await Comment.create({
      comment_text,
      post_id,
      user_id,
    });

    res.status(201).json({ message: 'Comment created successfully.', comment: newComment });
  } catch (err) {
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
        user_id: userId, // CRITICAL: This ensures only the owner can update the comment
      },
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to update it.' });
    }

    // Update the comment text
    const updatedComment = await comment.update({ comment_text });

    res.status(200).json({ message: 'Comment updated successfully.', comment: updatedComment });
  } catch (err) {
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

    // Delete the comment, but only if it belongs to the authenticated user
    const deletedCount = await Comment.destroy({
      where: {
        id: commentId,
        user_id: userId, // CRITICAL: This ensures only the owner can delete the comment
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Comment not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment.', error: err.message });
  }
});

module.exports = router;
