const { User, College, Appointment, Department, UserCollege, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');


exports.getDepartmentAppointments = async (req, res) => {
  try {
    // Get manager's department
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: Department,
        as: 'department'
      }]
    });

    if (!managerMembership || !managerMembership.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a department'
      });
    }

    const { status, from, to } = req.query;
    const whereClause = {
      departmentId: managerMembership.departmentId
    };

    // Status filter
    if (status) {
      whereClause.status = status;
    }

    // Date filters
    if (from || to) {
      whereClause.startTime = {};
      if (from) whereClause.startTime[Op.gte] = new Date(from);
      if (to) whereClause.startTime[Op.lte] = new Date(to);
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: College,
          as: 'college',
          attributes: ['id', 'name']
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length,
      department: managerMembership.department
    });
  } catch (error) {
    console.error('Get department appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department appointments'
    });
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get manager's department
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        collegeRole: 'MANAGER',
        isActive: true
      }
    });

    if (!managerMembership || !managerMembership.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a department'
      });
    }

    const appointment = await Appointment.findOne({
      where: { 
        id,
        departmentId: managerMembership.departmentId,
        status: 'PENDING'
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not pending approval'
      });
    }

    await appointment.update({
      status: 'CONFIRMED',
      metadata: {
        ...appointment.metadata,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        approvalNotes: notes
      }
    });

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve appointment'
    });
  }
};

exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Get manager's department
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        collegeRole: 'MANAGER',
        isActive: true
      }
    });

    if (!managerMembership || !managerMembership.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a department'
      });
    }

    const appointment = await Appointment.findOne({
      where: { 
        id,
        departmentId: managerMembership.departmentId,
        status: 'PENDING'
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not pending approval'
      });
    }

    await appointment.update({
      status: 'CANCELLED',
      cancellationReason: reason,
      metadata: {
        ...appointment.metadata,
        rejectedBy: req.user.id,
        rejectedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Appointment rejected successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject appointment'
    });
  }
};

exports.getDepartmentReports = async (req, res) => {
  try {
    // Get manager's department
    const managerMembership = await UserCollege.findOne({
      where: { 
        userId: req.user.id,
        collegeRole: 'MANAGER',
        isActive: true
      },
      include: [{
        model: Department,
        as: 'department'
      }]
    });

    if (!managerMembership || !managerMembership.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to a department'
      });
    }

    const { from, to } = req.query;
    const whereClause = {
      departmentId: managerMembership.departmentId
    };

    // Date filters
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    // Get appointment counts by status
    const appointments = await Appointment.findAll({
      where: whereClause,
      attributes: ['status', 'type', 'startTime']
    });

    // Calculate statistics
    const stats = {
      total: appointments.length,
      byStatus: {
        PENDING: 0,
        CONFIRMED: 0,
        CANCELLED: 0,
        COMPLETED: 0
      },
      byType: {},
      upcoming: 0,
      past: 0
    };

    const now = new Date();
    
    appointments.forEach(appt => {
      // Status counts
      stats.byStatus[appt.status] = (stats.byStatus[appt.status] || 0) + 1;
      
      // Type counts
      stats.byType[appt.type] = (stats.byType[appt.type] || 0) + 1;
      
      // Upcoming vs past
      if (appt.startTime > now) {
        stats.upcoming++;
      } else {
        stats.past++;
      }
    });

    res.json({
      success: true,
      data: {
        department: managerMembership.department,
        stats,
        appointments: appointments.slice(0, 50) // Last 50 appointments
      }
    });
  } catch (error) {
    console.error('Get department reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department reports'
    });
  }
};



exports.getDepartmentInfo = async (req, res) => {
  try {
    const managerMembership = await UserCollege.findOne({
      where: { userId: req.user.id,  isActive: true },
      include: [{ model: Department, as: 'department' }]
    });

    if (!managerMembership || !managerMembership.departmentId) {
      return res.status(403).json({ success: false, message: 'No department assigned' });
    }

    res.json({ success: true, data: managerMembership.department });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch department info' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const managerMembership = await UserCollege.findOne({
      where: { userId: req.user.id, isActive: true }
    });

    const deptId = managerMembership.departmentId;
    const now = new Date();
    const todayStart = new Date().setHours(0, 0, 0, 0);

    const [total, pending, confirmed, today] = await Promise.all([
      Appointment.count({ where: { departmentId: deptId } }),
      Appointment.count({ where: { departmentId: deptId, status: 'PENDING' } }),
      Appointment.count({ where: { departmentId: deptId, status: 'CONFIRMED' } }),
      Appointment.count({ 
        where: { 
          departmentId: deptId, 
          startTime: { [Op.gte]: todayStart } 
        } 
      })
    ]);

    res.json({
      success: true,
      data: {
        totalAppointments: total,
        pendingApprovalsCount: pending,
        upcomingAppointments: confirmed,
        todayAppointments: today,
        departmentName: managerMembership.department?.name
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats',error:error.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const managerMembership = await UserCollege.findOne({
      where: { userId: req.user.id,  isActive: true }
    });

    const approvals = await Appointment.findAll({
      where: { 
        departmentId: managerMembership.departmentId,
        status: 'PENDING'
      },
      include: [{ model: User, as: 'creator', attributes: ['firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending approvals' });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    await appointment.update({ 
      status: 'CANCELLED',
      cancellationReason: reason || 'Cancelled by Department Manager'
    });

    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
  }
};

exports.approveStudentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    // Implementation depends on if "Requests" is a separate table or just an Appointment type
    // Assuming it updates an Appointment status for this example
    const request = await Appointment.findByPk(id);
    await request.update({ status: 'CONFIRMED', metadata: { ...request.metadata, type: 'STUDENT_REQ_APPROVED' } });
    
    res.json({ success: true, message: 'Request approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
};

exports.rejectStudentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await Appointment.findByPk(id);
    await request.update({ status: 'REJECTED', cancellationReason: reason });
    
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
};