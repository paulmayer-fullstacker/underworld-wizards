const jwt = require('jsonwebtoken');
const { User } = require("../models");

// Set token secret and expiration date
const secret = 'mysecretssshhhhhhh'; 
const expiration = '2h';

module.exports = {
  // Function for our authenticated routes
  authMiddleware: function ( req, res, next ) {
    // Allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
    // Split the token string into an array and return actual token
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }
    // If no token, respond with 401 - Not Authorised
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing. You need to be logged in.' });
    }
    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; 
      // If verification is successful, pass the request to the next middleware/route handler
      next();
    } catch (err) {
      // If token verification fails, respond with 403 - Invalid or Expired
      console.log('Invalid token:', err.message); // Log the actual error message for debugging
      return res.status(403).json({ message: 'Invalid or expired token. Please log in again.' });
    }
  },
  // Function to sign a JWT token
  signToken: function ({ email, username, id }) {
    const payload = { email, username, id }; // Include all necessary user data here
    // Sign the token with payload, secret, and expiration
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
