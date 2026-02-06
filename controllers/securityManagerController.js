
// ==================== SECURITY_MANAGER CONTROLLERS ====================

// 18. Create security personnel
exports.createSecurityPersonnel = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, shift } = req.body;
    
    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
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
    const security = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'SECURITY',
      isActive: true
    });

    // Add to UserCollege junction
    await UserCollege.create({
      userId: security.id,
      collegeId: managerMembership.collegeId,
      collegeRole: 'SECURITY',
      isActive: true,
      permissions: {
        shift: shift || 'FULL_DAY',
        canCheckIn: true,
        canCheckOut: true
      }
    });

    // Remove password from response
    const securityResponse = security.toJSON();
    delete securityResponse.password;

    res.status(201).json({
      success: true,
      message: 'Security personnel created successfully',
      data: securityResponse
    });
  } catch (error) {
    console.error('Create security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create security personnel'
    });
  }
};

// 19. Get all security personnel
exports.getAllSecurityPersonnel = async (req, res) => {
  try {
    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    const securityPersonnel = await UserCollege.findAll({
      where: { 
        collegeId: managerMembership.collegeId,
        collegeRole: 'SECURITY',
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'SECURITY' },
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.json({
      success: true,
      data: securityPersonnel,
      count: securityPersonnel.length
    });
  } catch (error) {
    console.error('Get security personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security personnel'
    });
  }
};

// 20. Get specific security personnel
exports.getSecurityPersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    const security = await UserCollege.findOne({
      where: { 
        userId: id,
        collegeId: managerMembership.collegeId,
        collegeRole: 'SECURITY',
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!security) {
      return res.status(404).json({
        success: false,
        message: 'Security personnel not found in your college'
      });
    }

    res.json({
      success: true,
      data: security
    });
  } catch (error) {
    console.error('Get security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security personnel'
    });
  }
};

// 21. Update security personnel
exports.updateSecurityPersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, isActive } = req.body;

    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    // Check if security exists in manager's college
    const securityMembership = await UserCollege.findOne({
      where: { 
        userId: id,
        collegeId: managerMembership.collegeId,
        collegeRole: 'SECURITY'
      }
    });

    if (!securityMembership) {
      return res.status(404).json({
        success: false,
        message: 'Security personnel not found in your college'
      });
    }

    // Update user details
    const securityUser = await User.findByPk(id);
    if (!securityUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (isActive !== undefined) {
      updateData.isActive = isActive;
      securityMembership.isActive = isActive;
      await securityMembership.save();
    }

    await securityUser.update(updateData);

    // Remove password from response
    const updatedUser = securityUser.toJSON();
    delete updatedUser.password;

    res.json({
      success: true,
      message: 'Security personnel updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security personnel'
    });
  }
};

// 22. Delete security personnel
exports.deleteSecurityPersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    // Check if security exists in manager's college
    const securityMembership = await UserCollege.findOne({
      where: { 
        userId: id,
        collegeId: managerMembership.collegeId,
        collegeRole: 'SECURITY'
      }
    });

    if (!securityMembership) {
      return res.status(404).json({
        success: false,
        message: 'Security personnel not found in your college'
      });
    }

    // Soft delete user
    const securityUser = await User.findByPk(id);
    if (!securityUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await securityUser.update({ isActive: false });
    await securityMembership.update({ isActive: false });

    res.json({
      success: true,
      message: 'Security personnel deleted successfully'
    });
  } catch (error) {
    console.error('Delete security error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete security personnel'
    });
  }
};

// 23. Update security shift
exports.updateSecurityShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shift } = req.body;

    if (!shift) {
      return res.status(400).json({
        success: false,
        message: 'Shift is required'
      });
    }

    // Get security manager's college
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      }
    });

    if (!managerMembership) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a college'
      });
    }

    // Check if security exists in manager's college
    const securityMembership = await UserCollege.findOne({
      where: { 
        userId: id,
        collegeId: managerMembership.collegeId,
        collegeRole: 'SECURITY',
        isActive: true
      }
    });

    if (!securityMembership) {
      return res.status(404).json({
        success: false,
        message: 'Security personnel not found in your college'
      });
    }

    // Update shift in permissions
    const permissions = securityMembership.permissions || {};
    permissions.shift = shift;
    
    await securityMembership.update({ permissions });

    res.json({
      success: true,
      message: 'Security shift updated successfully',
      data: {
        userId: id,
        shift
      }
    });
  } catch (error) {
    console.error('Update shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security shift'
    });
  }
};

