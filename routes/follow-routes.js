// routes/follow-routes.js
// Define API routes for managing user follow relationships. Allowing users to follow and unfollow other users.

// Create a new Express router for handling follow-related API requests.
const router = require('express').Router();
// Import `Follow` model, representing the "follow" table in our Db (stores who is stalking who).
const { Follow } = require('../models');
// Import authMiddleware`, to protect these routes. Ensuring only authenticated (logged-in) users can follow or unfollow other users.
const { authMiddleware } = require('../utils/auth');

// POST a new follow relationship
// This endpoint allows a logged-in user to follow another user. The followed_id is passed in the request body.
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Get `followed_id` from request body. ID of the user being followed.
    const { followed_id } = req.body;
    // Get `follower_id` from `req.user.id` (set by the `authMiddleware`). ID of the current logged-in user who wants to follow.
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
    // Check Db. If: follow relationship (between these two users) already exists.
    if (existingFollow) {
      return res.status(409).json({ message: 'You are already following this user.' });
    }
    // Else: create a new entry in the `Follow` table.
    const newFollow = await Follow.create({ follower_id, followed_id });
    // Return 200 OK status, with success message and the new follow object.
    res.status(200).json({ message: 'User followed successfully!', follow: newFollow });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ message: 'Failed to follow user.', error: err.message });
  }
});

// DELETE an existing follow relationship
// This endpoint allows a logged-in user to unfollow another user. The followed_id is passed in the URL parameters.
router.delete('/:followed_id', authMiddleware, async (req, res) => {
  try {
    // Get `follower_id` from the authenticated user's token.
    const follower_id = req.user.id;
    // Get `followed_id` from the URL parameter.
    const followed_id = req.params.followed_id;
    // `Follow.destroy` method to delete the follow relationship from the database.
    const deletedCount = await Follow.destroy({
      // The `where` clause ensures we only delete the specific relationship where the `follower_id` is the logged-in user and the `followed_id` matches the one in the URL.
      where: {
        follower_id,
        followed_id,
      },
    });
    // If: `deletedCount` is 0: no matching follow record found to delete. Return a 404 Not Found status.
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'No follow relationship found to delete.' });
    }
    // Else: Record successfully deleted. Rreturn a 200 OK status with a success message.
    res.status(200).json({ message: 'User unfollowed successfully!' });
  } catch (err) {
    // Catch all other cases
    console.error('Error unfollowing user:', err);
    res.status(500).json({ message: 'Failed to unfollow user.', error: err.message });
  }
});
// Export router for inclusion and use in `routes/index.js`.
module.exports = router;
