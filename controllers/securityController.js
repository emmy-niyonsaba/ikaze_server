const { Appointment, User, College } = require('../models');
const { Op } = require('sequelize');

exports.checkInAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const securityUserId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { 
        id: appointmentId,
        status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or cannot be checked in'
      });
    }

    // Check if already checked in
    if (appointment.checkedInAt) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already checked in'
      });
    }

    // Check if appointment time is valid
    const now = new Date();
    if (now < appointment.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time has not started yet'
      });
    }

    if (now > appointment.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time has expired'
      });
    }

    await appointment.update({
      checkedInAt: now,
      checkedInBy: securityUserId,
      status: 'CONFIRMED'
    });

    // Get updated appointment with relations
    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName', 'phone'] },
        { model: College, as: 'college', attributes: ['name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Appointment checked in successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in appointment',
      error: error.message
    });
  }
};

// 2. Check-out appointment
exports.checkOutAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const securityUserId = req.user.id;

    const appointment = await Appointment.findOne({
      where: { 
        id: appointmentId,
        status: 'CONFIRMED',
        checkedInAt: { [Op.ne]: null }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not checked in'
      });
    }

    // Check if already checked out
    if (appointment.checkedOutAt) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already checked out'
      });
    }

    await appointment.update({
      checkedOutAt: new Date(),
      checkedOutBy: securityUserId,
      status: 'COMPLETED'
    });

    // Get updated appointment
    const updatedAppointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] },
        { model: College, as: 'college', attributes: ['name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Appointment checked out successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out appointment',
      error: error.message
    });
  }
};

// 3. Get appointments handled by security (with filters)
exports.getMyHandledAppointments = async (req, res) => {
  try {
    const { from, to, status, type, collegeId } = req.query;
    const securityUserId = req.user.id;

    const whereClause = {
      [Op.or]: [
        { checkedInBy: securityUserId },
        { checkedOutBy: securityUserId }
      ]
    };

    // Date filters
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    // Additional filters
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (collegeId) whereClause.collegeId = collegeId;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name', 'code']
        },
        {
          model: User,
          as: 'checkInUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'checkOutUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('Error fetching security appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// 4. Get today's appointments for check-in
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.findAll({
      where: {
        startTime: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'phone']
        },
        {
          model: College,
          as: 'college',
          attributes: ['name', 'code']
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s appointments',
      error: error.message
    });
  }
};

// 5. Verify appointment code
exports.verifyAppointmentCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Appointment code is required'
      });
    }

    const appointment = await Appointment.findOne({
      where: {
        [Op.or]: [
          { aptCode: code },
          { referenceNumber: code }
        ],
        status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['firstName', 'lastName', 'phone']
        },
        {
          model: College,
          as: 'college',
          attributes: ['name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Invalid appointment code or appointment not available'
      });
    }

    // Check if appointment is for today
    const today = new Date();
    const appointmentDate = new Date(appointment.startTime);
    const isToday = appointmentDate.toDateString() === today.toDateString();

    res.json({
      success: true,
      data: appointment,
      isToday: isToday,
      canCheckIn: !appointment.checkedInAt,
      canCheckOut: appointment.checkedInAt && !appointment.checkedOutAt
    });

  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify appointment code',
      error: error.message
    });
  }
};



// 24. Get security reports
exports.getSecurityReports = async (req, res) => {
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

    const { from, to } = req.query;
    const whereClause = {
      collegeId: managerMembership.collegeId
    };

    // Date filters
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    // Get all appointments for the college
    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'checkInUser',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: User,
          as: 'checkOutUser',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Department,
          as: 'appointmentDepartment',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    // Calculate security statistics
    const securityStats = {};
    const departmentStats = {};
    let totalCheckIns = 0;
    let totalCheckOuts = 0;
    let totalNoShows = 0;

    appointments.forEach(appt => {
      // Count by security personnel
      if (appt.checkedInBy) {
        totalCheckIns++;
        const securityId = appt.checkInUser?.id || 'unknown';
        securityStats[securityId] = securityStats[securityId] || {
          name: appt.checkInUser ? `${appt.checkInUser.firstName} ${appt.checkInUser.lastName}` : 'Unknown',
          checkIns: 0,
          checkOuts: 0
        };
        securityStats[securityId].checkIns++;
      }

      if (appt.checkedOutBy) {
        totalCheckOuts++;
        const securityId = appt.checkOutUser?.id || 'unknown';
        securityStats[securityId] = securityStats[securityId] || {
          name: appt.checkOutUser ? `${appt.checkOutUser.firstName} ${appt.checkOutUser.lastName}` : 'Unknown',
          checkIns: 0,
          checkOuts: 0
        };
        securityStats[securityId].checkOuts++;
      }

      // Count no-shows (confirmed but not checked in)
      if (appt.status === 'CONFIRMED' && !appt.checkedInAt) {
        totalNoShows++;
      }

      // Count by department
      const deptName = appt.appointmentDepartment?.name || 'Unknown';
      departmentStats[deptName] = departmentStats[deptName] || 0;
      departmentStats[deptName]++;
    });

    res.json({
      success: true,
      data: {
        totalAppointments: appointments.length,
        totalCheckIns,
        totalCheckOuts,
        totalNoShows,
        securityPerformance: Object.values(securityStats),
        departmentActivity: Object.entries(departmentStats).map(([name, count]) => ({ name, count })),
        recentActivity: appointments.slice(0, 50).map(appt => ({
          id: appt.id,
          referenceNumber: appt.referenceNumber,
          status: appt.status,
          checkedInAt: appt.checkedInAt,
          checkedOutAt: appt.checkedOutAt,
          department: appt.appointmentDepartment?.name,
          checkInBy: appt.checkInUser ? `${appt.checkInUser.firstName} ${appt.checkInUser.lastName}` : null,
          checkOutBy: appt.checkOutUser ? `${appt.checkOutUser.firstName} ${appt.checkOutUser.lastName}` : null
        }))
      }
    });
  } catch (error) {
    console.error('Get security reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security reports'
    });
  }
};
