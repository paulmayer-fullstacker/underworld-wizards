// // routes/user.js
// const router = require("express").Router();
// const { User, Post, Comment, Like, Follow } = require("../models");
// const sequelize = require('../config/connection');  // Importing sequelize to accommodate sequelize.literal queries
// const { signToken, authMiddleware } = require("../utils/auth");

// // Get current authenticated user's data
// // This route is protected by authMiddleware.
// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Not authenticated or user ID missing from token." });
//     }

//     const user = await User.findByPk(req.user.id, {
//       attributes: {
//         exclude: ['password'],
//         // NEW: Use Sequelize.fn to count followers and following
//         include: [
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
//         ]
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Authenticated user not found in database." });
//     }

//     return res.status(200).json({ user: user.toJSON() });
//   } catch (err) {
//     console.error("Error fetching user data for /me:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// // GET a single User record by ID
// // This route is public, but you might want to protect it or limit returned data.
// router.get("/:id", async (req, res) => {
//   console.log("Looking for user ID:", req.params.id);
//   try {
//     const userData = await User.findByPk(req.params.id, {
//       attributes: {
//         exclude: ['password'],
//         // NEW: Use Sequelize.fn to count followers and following
//         include: [
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
//         ]
//       },
//     });

//     if (!userData) {
//       res.status(404).json({ message: "No User found with this ID." });
//       return;
//     }

//     res.status(200).json(userData);
//   } catch (err) {
//     console.error("Error fetching user by ID:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// // GET all User records
// // This route is protected by authMiddleware.
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: {
//         exclude: ['password'],
//         // NEW: Use Sequelize.fn to count followers and following
//         include: [
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
//           [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
//         ]
//       },
//       // You must add group to avoid duplicate rows from the count
//       group: ['user.id']
//     });
//     res.status(200).json(users);
//   } catch (err) {
//     console.error("Error fetching all users:", err);
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// // Register User Route (Public)
// router.post("/", async (req, res) => {
//   console.log("--- Inside POST /api/users (Register) route ---");
//   console.log("Request Body (req.body):", req.body);

//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res.status(400).json({ message: 'Username, email, and password are required for registration.' });
//     }

//     const newUser = await User.create({
//       username,
//       email,
//       password,
//     });

//     console.log("New user created successfully:", newUser.toJSON());

//     // Log the user in immediately after registration by signing a token
//     const token = signToken(newUser);
//     // Return token and basic user info (ID, username) for frontend to store
//     res.status(200).json({ message: 'Registration successful!', token, user_id: newUser.id, username: newUser.username });

//   } catch (err) {
//     console.error("Error during user registration:", err);

//     if (err.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({ message: 'Email or username already exists. Please choose another.' });
//     }
//     if (err.name === 'SequelizeValidationError') {
//       const errors = err.errors.map(e => e.message);
//       return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
//     }

//     res.status(500).json({ message: 'Failed to register user due to a server error.', details: err.message });
//   }
// });

// // UPDATE the User record 
// router.put("/:id", authMiddleware, async (req, res) => { 
//   try {
//     // Get the ID of the authenticated user from the token
//     const authenticatedUserId = req.user.id;
//     const targetUserId = parseInt(req.params.id);
//     if (authenticatedUserId !== targetUserId) {
//       return res.status(403).json({ message: "Unauthorized: You can only update your own profile." });
//     }
//     const { username, email, password } = req.body;
//     const updateFields = {};

//     if (username) updateFields.username = username;
//     if (email) updateFields.email = email;
//     if (password) updateFields.password = password; 

//     if (Object.keys(updateFields).length === 0) {
//       return res.status(400).json({ message: "No valid fields provided for update." });
//     }

//     const [affectedRows] = await User.update(updateFields, {
//       where: {
//         id: targetUserId, // Use the ID from the URL parameter
//       },
//       individualHooks: true 
//     });

//     if (affectedRows === 0) {
//       res.status(404).json({ message: "No User found with this ID or no changes applied." });
//       return;
//     }
//     const updatedUser = await User.findByPk(targetUserId, {
//       attributes: { exclude: ['password'] }
//     });
//     res.status(200).json(updatedUser);
//   } catch (err) {
//     console.error("Error updating user:", err);
//     if (err.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({ message: 'Email or username already exists. Please choose another.' });
//     }
//     res.status(500).json({ message: "Internal server error.", details: err.message });
//   }
// });

// // Login Route (Public)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const userData = await User.findOne({ where: { email } }); 

//     if (!userData) {
//       res.status(400).json({ message: "Incorrect email or password, please try again" });
//       return;
//     }
//     const validPassword = await userData.checkPassword(password); 
//     if (!validPassword) {
//       res.status(400).json({ message: "Incorrect email or password, please try again" });
//       return;
//     }
//     const token = signToken(userData);
//     // Return token and user_id/username for frontend to store and use
//     res.status(200).json({ token, user_id: userData.id, username: userData.username });

//   } catch (err) {
//     console.error("Error during login:", err);
//     res.status(500).json({ message: "Internal server error during login.", details: err.message });
//   }
// });

// // Logout Route
// router.post("/logout", (req, res) => {
//   res.status(204).end(); // 204 No Connection
// });

// module.exports = router;

// routes/user.js
const router = require("express").Router();
const { User, Post, Comment, Like, Follow } = require("../models");
const sequelize = require('../config/connection');
const { signToken, authMiddleware } = require("../utils/auth");

// Get current authenticated user's data
// This route is protected by authMiddleware.
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated or user ID missing from token." });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['password'],
        // Include counts for followers and following using sequelize.literal
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // NEW: Include the actual list of followers and following
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

    if (!user) {
      return res.status(404).json({ message: "Authenticated user not found in database." });
    }

    return res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    console.error("Error fetching user data for /me:", err);
    res.status(500).json({ message: "Internal server error.", details: err.message });
  }
});

// GET a single User record by ID
// This route is public, but you might want to protect it or limit returned data.
router.get("/:id", async (req, res) => {
  console.log("Looking for user ID:", req.params.id);
  try {
    const userData = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password'],
        // Include counts for followers and following using sequelize.literal
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // NEW: Include the actual list of followers and following
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

// GET all User records
// This route is protected by authMiddleware.
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password'],
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `followed_id` = `user`.`id`)'), 'followerCount'],
          [sequelize.literal('(SELECT COUNT(*) FROM `follow` WHERE `follower_id` = `user`.`id`)'), 'followingCount']
        ]
      },
      // You must add group to avoid duplicate rows from the count
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

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required for registration.' });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    console.log("New user created successfully:", newUser.toJSON());

    // Log the user in immediately after registration by signing a token
    const token = signToken(newUser);
    // Return token and basic user info (ID, username) for frontend to store
    res.status(200).json({ message: 'Registration successful!', token, user_id: newUser.id, username: newUser.username });

  } catch (err) {
    console.error("Error during user registration:", err);

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
    if (authenticatedUserId !== targetUserId) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own profile." });
    }
    const { username, email, password } = req.body;
    const updateFields = {};

    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const [affectedRows] = await User.update(updateFields, {
      where: {
        id: targetUserId, // Use the ID from the URL parameter
      },
      individualHooks: true
    });

    if (affectedRows === 0) {
      res.status(404).json({ message: "No User found with this ID or no changes applied." });
      return;
    }
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
    const validPassword = await userData.checkPassword(password);
    if (!validPassword) {
      res.status(400).json({ message: "Incorrect email or password, please try again" });
      return;
    }
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

