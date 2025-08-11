// routes/follow-routes.js
const router = require('express').Router();
const { Follow } = require('../models');
const { authMiddleware } = require('../utils/auth');

// POST a new follow relationship
// This endpoint allows a logged-in user to follow another user.
// The followed_id is passed in the request body.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { followed_id } = req.body;
    const follower_id = req.user.id;

    // Check if the user is trying to follow themselves
    if (follower_id === followed_id) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }
    
    // Check if the follow relationship already exists
    const existingFollow = await Follow.findOne({
      where: {
        follower_id,
        followed_id,
      },
    });

    if (existingFollow) {
      return res.status(409).json({ message: 'You are already following this user.' });
    }

    const newFollow = await Follow.create({ follower_id, followed_id });

    res.status(200).json({ message: 'User followed successfully!', follow: newFollow });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ message: 'Failed to follow user.', error: err.message });
  }
});

// DELETE an existing follow relationship
// This endpoint allows a logged-in user to unfollow another user.
// The followed_id is passed in the URL parameters.
router.delete('/:followed_id', authMiddleware, async (req, res) => {
  try {
    const follower_id = req.user.id;
    const followed_id = req.params.followed_id;

    const deletedCount = await Follow.destroy({
      where: {
        follower_id,
        followed_id,
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'No follow relationship found to delete.' });
    }

    res.status(200).json({ message: 'User unfollowed successfully!' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ message: 'Failed to unfollow user.', error: err.message });
  }
});

module.exports = router;
