// controllers/manage.users.controller.js
const { User, College, Appointment, Department, UserCollege } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');








// ==================== SUPER_ADMIN CONTROLLERS ====================

exports.createCollege = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      location, 
      phone, 
      email, 
      website, 
      timezone, 
      operatingHours, 
      settings 
    } = req.body;

    // Check if college code already exists
    const existingCollege = await College.findOne({ where: { code: code.toUpperCase() } });
    if (existingCollege) {
      return res.status(400).json({
        success: false,
        message: 'A college with this code already exists'
      });
    }

    const college = await College.create({
      name,
      code: code.toUpperCase(),
      location,
      phone,
      email,
      timezone,
      operatingHours, 
      settings,      
      createdBy: req.user.id,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      data: college
    });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create college',
      error: error.message
    });
  }
};


// 2. Get all colleges
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: colleges,
      count: colleges.length
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
};


// 3. Get specific college
exports.getCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Department,
          as: 'departments',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.json({
      success: true,
      data: college
    });
  } catch (error) {
    console.error('Get college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college'
    });
  }
};
// 4. Update college

exports.updateCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // If updating manager, validate
    if (req.body.managerId) {
      const manager = await User.findOne({
        where: { 
          id: req.body.managerId, 
          role: 'COLLEGE_ADMIN',
          isActive: true 
        }
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: 'Valid COLLEGE_ADMIN manager required'
        });
      }
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    await college.update(req.body);

    res.json({
      success: true,
      message: 'College updated successfully',
      data: college
    });
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update college'
    });
  }
};

// 5. Delete college (soft delete)
exports.deleteCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    await college.update({ isActive: false });

    res.json({
      success: true,
      message: 'College deleted successfully'
    });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete college'
    });
  }
};



exports.createCollegeAdmin = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { firstName, lastName, email, phone, password, role, collegeId } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
          { email }, 
          { phone: phone || null }
        ] 
      },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email or phone already exists'
      });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User in 'users' table
    const admin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role,
      isActive: true
    }, { transaction });

    // 4. If it's a College Manager, handle College mapping and update College table
    if (role === 'COLLEGE_MANAGER' && collegeId) {
      // Create junction table entry
      await UserCollege.create({
        userId: admin.id,
        collegeId: collegeId,
        collegeRole: 'MANAGER',
        isActive: true,
        permissions: {
          canCreateAppointments: true,
          canInviteGuests: true,
          maxGuests: 10,
          canViewAllAppointments: true
        }
      }, { transaction });

      // Update the College record to set this user as the primary manager
      await College.update(
        { managerId: admin.id },
        { 
          where: { id: collegeId },
          transaction 
        }
      );
    }

    // Commit the transaction
    await transaction.commit();

    // Prepare response
    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Administrator created and assigned to college successfully',
      data: adminResponse
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create administrator'
    });
  }
};


// 7. Get all college admins
exports.getAllCollegeAdmins = async (req, res) => {
  try {

    const admins = await User.findAll({
      where: {
        role: 'COLLEGE_MANAGER',
        isActive: true
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: College,
          as: 'managedCollege', // Matches the alias in User.associate
          attributes: ['id', 'name', 'code', 'location']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: admins,
      count: admins.length
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college admins',
      error: error.message
    });
  }
};


// 10. Get Super Admin Dashboard Stats
exports.getCollegeStats = async (req, res) => {
  try {
    // 1. Get Total Colleges (Active)
    const totalColleges = await College.count({
      where: { isActive: true }
    });

    // 2. Get Total Admins (COLLEGE_ADMIN role)
    const totalAdmins = await User.count({
      where: { 
        role: {
          [Op.ne]: 'USER' 
        },
        isActive: true 
      }
    });

    // 3. Get Total Active End-Users (Assuming role 'USER' or similar)
    const activeUsers = await User.count({
      where: { 
        isActive: true 
      }
    });

    // 4. Get Recent Colleges for the Dashboard list
    const recentColleges = await College.findAll({
      limit: 5,
      where: { isActive: true },
      include: [{
        model: User,
        as: 'manager',
        attributes: ['firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    // 5. System Trends (Example: Monthly Growth)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const collegesLastMonth = await College.count({
      where: {
        createdAt: { [Op.gte]: lastMonth },
        isActive: true
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalColleges,
          totalAdmins,
          activeUsers,
          growth: collegesLastMonth
        },
        recentColleges
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};



// 11. Toggle Admin Status (Active/Inactive)
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Toggle the isActive boolean
    await admin.update({ isActive: !admin.isActive });

    res.json({
      success: true,
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: admin.isActive }
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin status'
    });
  }
};


// 8. Assign admin to college
exports.assignAdminToCollege = async (req, res) => {
  try {
    const { collegeId, adminId } = req.body;

    const college = await College.findByPk(collegeId);
    const admin = await User.findOne({
      where: { 
        id: adminId, 
        role: 'COLLEGE_ADMIN',
        isActive: true 
      }
    });

    if (!college || !admin) {
      return res.status(404).json({
        success: false,
        message: 'College or admin not found'
      });
    }

    await college.update({ managerId: adminId });

    res.json({
      success: true,
      message: 'Admin assigned to college successfully',
      data: { college, admin }
    });
  } catch (error) {
    console.error('Assign admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign admin to college'
    });
  }
};

// 9. Remove admin from college
exports.removeAdminFromCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const college = await College.findByPk(collegeId);
    
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    await college.update({ managerId: null });

    res.json({
      success: true,
      message: 'Admin removed from college successfully'
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove admin from college'
    });
  }
};









module.exports = exports;