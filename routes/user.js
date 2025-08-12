// routes/user.js
// Define all user-related API endpoints, including registration, login, fetching user data, and profile updates.

// Create Express router for user routes.
const router = require("express").Router();
// Import necessary models.
const { User, Post, Comment, Like, Follow } = require("../models");
// Import Sequelize instance to use raw SQL for calculating follower and following counts
const sequelize = require('../config/connection');
// Import `signToken` to generate JWTs on login/registration and `authMiddleware` to protect certain routes.
const { signToken, authMiddleware } = require("../utils/auth");

// Get current authenticated user's data (protected).
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated or user ID missing from token." });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password'],
        // Use `sequelize.literal` to execute a raw SQL subquery to count the number of followers and following.
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // Eagerly load the actual list of users who are followers and following
      include: [
        {
          model: User,
          as: 'Following', // Alias as defined in the User model association
          attributes: { exclude: ['password'] } // Exclude password from the included users
        },
        {
          model: User,
          as: 'Followers', // Alias as defined in the User model association
          attributes: { exclude: ['password'] } // Exclude password from the included users
        }
      ]
    });
    // If no user
    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found in database." });
    }
    // Else: Return the user's data with a 200 OK status. `toJSON()` converts the Sequelize instance into a plain JavaScript object
    return res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    console.error("Error fetching user data for /me:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});

// GET a single User record by ID
router.get("/:id", async (req, res) => {
  console.log("Looking for user ID:", req.params.id);
  try {
    // Find the user by the ID from the URL parameter.
    const userData = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password'],
        // Include the follower and following counts using a raw SQL subquery.
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // Eagerly load the lists of followers and following.
      include: [
        {
          model: User,
          as: 'Following', // Alias as defined in the User model association
          attributes: { exclude: ['password'] }
        },
        {
          model: User,
          as: 'Followers', // Alias as defined in the User model association
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!userData) {
      res.status(404).json({ message: "No User found with this ID." });
      return;
    }

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});

// GET all User records (protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password'],
        // Include the follower and following counts.
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // Add 'group' to avoid duplicate rows from the count
      group: ['user.id']
    });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});

// Register User Route (Public)
router.post("/", async (req, res) => {
  console.log("--- Inside POST /api/users (Register) route ---");
  console.log("Request Body (req.body):", req.body);

  try {
    const { username, email, password } = req.body;
    // If: all required fields are NOT provided.
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required for registration.' });
    }
    // Else: `User.create` attempts to create a new user record.
    const newUser = await User.create({
      username,
      email,
      password,
    });
    // Log for debugging
    console.log("New user created successfully:", newUser.toJSON());
    // Log the user in immediately after registration by signing a token
    const token = signToken(newUser);
    // Return token and basic user info (ID, username) for frontend to store
    res.status(200).json({ message: 'Registration successful!', token, user_id: newUser.id, username: newUser.username });

  } catch (err) {
    console.error("Error during user registration:", err);
    // Handle specific Sequelize errors, such as duplicate entries or validation failures, to provide more specific feedback to the user.
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email or username already exists. Please choose another.' });
    }
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(e => e.message);
      return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
    }

    res.status(500).json({ message: 'Failed to register user due to a server error.', details: err.message });
  }
});

// UPDATE the User record 
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Get the ID of the authenticated user from the token
    const authenticatedUserId = req.user.id;
    const targetUserId = parseInt(req.params.id);
    // If user is user (owner). Ensuring the authenticated user can only update their own profile.
    if (authenticatedUserId !== targetUserId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own profile." });
    }
    const { username, email, password } = req.body;
    // Build `updateFields` object with only the fields that were provided in the request body
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }
    // Use `User.update` to update the user record.
    const [affectedRows] = await User.update(updateFields, {
      where: {
        id: targetUserId, // Use the ID from the URL parameter
      },
      // `individualHooks: true` ensures that any lifecycle hooks on the model (like password hashing) are run during the update.
      individualHooks: true
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: "No User found with this ID or no changes applied." });
      return;
    }
     // Fetch the updated user's data to return it in the response.
    const updatedUser = await User.findByPk(targetUserId, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email or username already exists. Please choose another.' });
    }
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});

// Login Route (Public)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ where: { email } });

    if (!userData) {
      res.status(400).json({ message: "Incorrect email or password, please try again" });
      return;
    }
    // Use `checkPassword` method (defined on the User model) to compare the provided password with the hashed password in the database.
    const validPassword = await userData.checkPassword(password);
    if (!validPassword) {
      res.status(400).json({ message: "Incorrect email or password, please try again" });
      return;
    }
    // If: password valid, sign a new JWT.
    const token = signToken(userData);
    // Return token and user_id/username for frontend to store and use
    res.status(200).json({ token, user_id: userData.id, username: userData.username });

  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error during login.", details: err.message });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  res.status(204).end(); // 204 No Connection
});

module.exports = router;

