const express = require('express');
const jwt = require('jsonwebtoken'); // Import JWT library
const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No Token' });
  }

  jwt.verify(token.replace('Bearer ', ''), process.env.JWT_PRIVATE, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken