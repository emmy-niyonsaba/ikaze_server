// controllers/manage.users.controller.js
const { User, College, Appointment, Department, UserCollege, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');




exports.createUserAccount = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      role,           
      collegeRole,    
      departmentId, 
      enrollmentNumber 
    } = req.body;

    // 1. Find the college managed by the logged-in COLLEGE_MANAGER
    const adminCollege = await College.findOne({
      where: { managerId: req.user.id }
    });

    if (!adminCollege) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a manager of any college.'
      });
    }

    // 2. Validate Department if provided
    if (departmentId) {
      const dept = await Department.findOne({
        where: { id: departmentId, collegeId: adminCollege.id }
      });
      if (!dept) {
        return res.status(400).json({ success: false, message: 'Invalid department for this college.' });
      }
    }

    // 3. Check if User already exists globally
    let user = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] }
    });

    // 4. Create global User if they don't exist
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: role || 'USER', 
        isActive: true
      });
    }

    // 5. Check if User is already a member of this specific college
    const existingMembership = await UserCollege.findOne({
      where: { userId: user.id, collegeId: adminCollege.id }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of your college.'
      });
    }

    // 6. Create the UserCollege junction entry
    const membership = await UserCollege.create({
      userId: user.id,
      collegeId: adminCollege.id,
      collegeRole: collegeRole || 'STUDENT', 
      departmentId: departmentId || null,
      enrollmentNumber: enrollmentNumber || null,
      isActive: true,
      joinedAt: new Date()
    });

    // 7. Prepare response (exclude sensitive data)
    const userJson = user.toJSON();
    delete userJson.password;

    res.status(201).json({
      success: true,
      message: 'User successfully added to college',
      data: {
        user: userJson,
        membership: {
          role: membership.collegeRole,
          enrollmentNumber: membership.enrollmentNumber,
          departmentId: membership.departmentId
        }
      }
    });

  } catch (error) {
    console.error('Create User Account Error:', error);
    // Handle Sequelize Unique Constraint for enrollmentNumber
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'Enrollment number already exists.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// 11. Get all department managers in college
exports.getCollegeDepartmentManagers = async (req, res) => {
  try {
    // Get admin's college
    const adminCollege = await College.findOne({
      where: {  }
    });

    if (!adminCollege) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    const departmentManagers = await UserCollege.findAll({
      where: { 
        collegeId: adminCollege.id,
        collegeRole: 'MANAGER',
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'DEPARTMENT_MANAGER' },
          attributes: { exclude: ['password'] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.json({
      success: true,
      data: departmentManagers,
      count: departmentManagers.length
    });
  } catch (error) {
    console.error('Get department managers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department managers'
    });
  }
};


exports.getCollegeDepartments = async (req, res) => {
  try {
    // Assuming req.user.collegeId is populated by your auth middleware
    const { collegeId } = req.user;
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a college.",
      });
    }

    const departments = await Department.findAll({
      where: { collegeId },
      include: [
        {
          model: User,
          as: "contactPerson",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [
        ["order", "ASC"],
        ["name", "ASC"],
      ],
    });

    return res.status(200).json(departments);
  } catch (error) {
    console.error("Error in getCollegeDepartments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching departments.",
      error: error.message,
    });
  }
};


exports.createDepartments = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      description, 
      contactEmail, 
      contactPhone, 
      contactUserId, 
      settings,
      order 
    } = req.body;

    // Automatically associate with the admin's college
    const collegeId = req.user.collegeId;

    // Check for existing code within the same college (unique index constraint)
    const existingDept = await Department.findOne({
      where: { collegeId, code: code.toUpperCase() }
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: `A department with code ${code} already exists in this college.`
      });
    }

    const newDepartment = await Department.create({
      name,
      code,
      description,
      collegeId,
      contactUserId,
      contactEmail,
      contactPhone,
      settings,
      order: order || 0,
      isActive: true
    });

    return res.status(201).json(newDepartment);

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    console.error("Create Department Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating department."
    });
  }
};


// 12. Create security manager
exports.createSecurityManager = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    
    // Get admin's college
    const adminCollege = await College.findOne({
      where: { managerId: req.user.id }
    });

    if (!adminCollege) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    // Check if email/phone exists
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [{ email }, { phone }] 
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const securityManager = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'SECURITY_MANAGER',
      isActive: true
    });

    // Add to UserCollege junction
    await UserCollege.create({
      userId: securityManager.id,
      collegeId: adminCollege.id,
      collegeRole: 'MANAGER',
      isActive: true
    });

    // Remove password from response
    const managerResponse = securityManager.toJSON();
    delete managerResponse.password;

    res.status(201).json({
      success: true,
      message: 'Security manager created successfully',
      data: {
        user: managerResponse,
        college: adminCollege
      }
    });
  } catch (error) {
    console.error('Create security manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security manager'
    });
  }
};

// 13. Get college users overview
exports.getCollegeUsers = async (req, res) => {
  try {
    // Get admin's college
    const adminCollege = await College.findOne({
      where: { managerId: req.user.id }
    });

    if (!adminCollege) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    // Get all users in college
    const collegeUsers = await UserCollege.findAll({
      where: { 
        collegeId: adminCollege.id,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [[{model: User, as: 'user'}, 'role', 'ASC']]
    });

    // Count by role
    const roleCounts = {
      DEPARTMENT_MANAGER: 0,
      SECURITY_MANAGER: 0,
      SECURITY: 0,
      USER: 0
    };

    collegeUsers.forEach(item => {
      if (roleCounts[item.user.role] !== undefined) {
        roleCounts[item.user.role]++;
      }
    });

    res.json({
      success: true,
      data: collegeUsers,
      counts: roleCounts,
      total: collegeUsers.length
    });
  } catch (error) {
    console.error('Get college users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college users'
    });
  }
};


// 14. Get dynamic dashboard statistics
exports.getCollegeDashboardStats = async (req, res) => {
  try {
    // Get admin's college
    const adminCollege = await College.findOne({
      where: { managerId: req.user.id }
    });

    if (!adminCollege) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    const collegeId = adminCollege.id;

    // Run counts in parallel
    const [totalUsers, activeSecurity, activeManagers, pendingApprovals] = await Promise.all([
      // 1. Total active users in this college
      UserCollege.count({ 
        where: { collegeId, isActive: true } 
      }),

      // 2. Active Security Personnel
      UserCollege.count({
        where: { collegeId, isActive: true },
        include: [{
          model: User,
          as: 'user',
          where: { role: { [Op.like]: '%SECURITY%' } }
        }]
      }),

      // 3. Active Department Managers
      UserCollege.count({
        where: { collegeId, collegeRole: 'MANAGER', isActive: true },
        include: [{
          model: User,
          as: 'user',
          where: { role: 'DEPARTMENT_MANAGER' }
        }]
      }),

      // 4. Pending Appointment Approvals
      Appointment.count({
        where: { 
          collegeId,
          status: 'PENDING' 
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSecurity,
        activeManagers,
        pendingApprovals
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// 15. Get college profile for the header
exports.getMyCollegeProfile = async (req, res) => {
  try {
    const college = await College.findOne({
      where: { managerId: req.user.id },
      include: [
        {
          model: User,
          as: 'manager', // Adjust alias based on your model association
          attributes: ['firstName', 'lastName', 'email', 'phone']
        }
      ]
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College profile not found'
      });
    }

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Get college profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college profile'
    });
  }
};

// 16. Update User Status (Activate/Deactivate)
exports.updateUserStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const adminCollege = await College.findOne({
      where: { managerId: req.user.id }
    });

    // Verify user belongs to this college before updating
    const userMembership = await UserCollege.findOne({
      where: { userId, collegeId: adminCollege.id }
    });

    if (!userMembership) {
      return res.status(404).json({ success: false, message: 'User not found in your college' });
    }

    // Update in junction and main table
    await UserCollege.update({ isActive }, { where: { userId, collegeId: adminCollege.id }, transaction: t });
    await User.update({ isActive }, { where: { id: userId }, transaction: t });

    await t.commit();
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

module.exports = exports;