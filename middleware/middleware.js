const jwt = require("jsonwebtoken");
const User = require("../models/User")
const UserCollege = require("../models/UserCollege")

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no Authorization header
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided. Please login."
      });
    }

    // Extract "Bearer token"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token format."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const uCollege = await UserCollege.findOne({ where: { userId: decoded.userId } });
    
    req.user = {
      ...decoded,
      collegeId: uCollege?.collegeId,
      id: decoded.userId
    }
    
    next(); // continue

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message
    });
  }
};
