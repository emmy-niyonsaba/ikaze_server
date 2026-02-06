const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { password, firstName, lastName, phone, email } = req.body;

    // Basic validation
    if (!password || !firstName || !lastName || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );


    return res.status(201).json({
      token,user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.profile = async(req,res)=>{
  try {

    const data = await User.findByPk(req.user.userId,{
      attributes: {
        exclude:["password"]
      }
    })
    if(!data) return res.status(500).json("Invalid PK")
    return res.json(data)
  } catch (error) {
     return res.status(401).json({message:error.message, error:"failed"})
  }
}


// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await User.scope('withPassword').findOne({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });
    user.lastLogin = new Date()
    await user.save();
    const token = jwt.sign(
      { userId: user.id, role: user.role,email:user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.password = undefined
    
    return res.json({
      token,
      user
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error.message, message:"failed" });
  }
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE USER (with appointments visible according to requester permissions)
exports.getUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const requesterId = req.user.userId;

    // fetch requester to determine role and rpCollege
    const requester = await User.findByPk(requesterId);
    if (!requester) return res.status(401).json({ message: "Invalid requester" });

    // allow owner to view their full profile
    if (requesterId === targetId) {
      const user = await User.findByPk(targetId, {
        attributes: { exclude: ["password"] },
        include: [{ model: require('../models/Appointment'), as: 'Appointments' }]
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json(user);
    }

    // allow ADMIN/DEAN to view other users but only appointments that belong to their college
    if (['ADMIN', 'DEAN'].includes(requester.role)) {
      const Appointment = require('../models/Appointment');

      const user = await User.findByPk(targetId, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Appointment,
            as: 'Appointments',
            where: { rpCollege: requester.rpCollege },
            required: false,
          },
        ],
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      return res.json(user);
    }

    // otherwise forbidden
    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, location } = req.body;
    
    // 1. Explicitly pick allowed fields to prevent "Role Injection"
    const updateData = { firstName, lastName, phone, email, location };

    // 2. Perform Update
    const [updatedRows] = await User.update(updateData, {
      where: { id: req.user.id }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ message: "User not found or no changes made" });
    }

    // 3. Fetch fresh user data to return to the frontend store
    const updatedUser = await User.findByPk(req.user.id);

    res.json({ 
      success: true,
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Find user with password included (since defaultScope excludes it)
    const user = await User.scope('withPassword').findByPk(req.user.id);
    
    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // 3. Hash and Save
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};








// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {id: req.params.id}
    })
    const deleted = await User.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
    console.log(user);
  } catch (error) {
    console.log(`error`);
   res.status(500).json({ error: error.message });

  }
};
