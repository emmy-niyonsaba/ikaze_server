const Appointments = require("../models/Appointment");
const {Op, json} = require("sequelize")
// CREATE appointment
const generateRef = function () {
  const id = this.id?.toString().padStart(6, "0");
  const y = new Date().getFullYear().toString().slice(-2);
  return `APT-${y}-${id}`;
};

exports.createAppointment = async (req, res) => {
  try {
    const userId = req.user.userId;

 
    const {
      type,
      period,
      startTime,
      endTime,
      description,
      rpCollege,
      department,
      attachmentUrls = [],
      guests,
      guestList
    } = req.body;

    // Basic guests validation (optional but helpful)
    if (!Array.isArray(guestList)) {
      return res.status(400).json({
        error: "Guests must be an array of objects { fullname, id }"
      });
    }

    const appointment = await Appointments.create({
      type,
      startTime,
      endTime,
      description,
      rpCollege,
      department,
      attachmentUrls,
      guests:guestList,
      UserId: userId,
    });

    appointment.referenceNumber = appointment.generateRef();
    await appointment.save();


    res.status(201).json(appointment);
  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({ error: error.message });
  }
};



// GET all appointments (role-aware, supports college & status filters)
exports.getAppointments = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;
    const { college, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    // Admin: can view all or filter by college
    if (role === "ADMIN") {
      if (college) where.rpCollege = college;
    }
    // Dean: only their college
    else if (role === "DEAN") {
      const requester = await require("../models/User").findByPk(userId);
      if (!requester) return res.status(401).json({ message: "Invalid requester" });
      where.rpCollege = requester.rpCollege;
    }
    // Security: restrict to their college as well
    else if (role === "SECURITY") {
      const requester = await require("../models/User").findByPk(userId);
      if (!requester) return res.status(401).json({ message: "Invalid requester" });
      where.rpCollege = requester.rpCollege;
    }
    // Regular user: only their appointments
    else if (role === "USER") {
      where.UserId = userId;
    }

    const appointments = await Appointments.findAll({
      where,
      include: [{ association: 'User', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      order: [["startTime", "ASC"]],
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointments.findAll({
      where:{
        UserId:{
          [Op.eq]:req.user.userId
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get pending Appoitments

exports.getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appointments.findAll({
      where: { status: "PENDING" },
      include: [{ association: 'User', attributes: ['email', 'firstName', 'lastName'] }]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET one appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [{ association: 'User', attributes: ['id', 'email', 'firstName', 'lastName', 'phone'] }]
    });
    if (!appointment) return res.status(404).json({ message: "Not found" });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAppointmentByRef = async (req, res) => {
  try {
    const appointment = await Appointments.findOne ({referenceNumber: req.params.ref}, {
      include: [{ association: 'User', attributes: ['id', 'email', 'firstName', 'lastName', 'phone'] }]
    });
    
    if (!appointment) return res.status(404).json({ message: "Not found" });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// UPDATE appointment
exports.updateAppointment = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.guests) {
      updateData.guests = typeof req.body.guests === "string" 
        ? JSON.parse(req.body.guests) 
        : req.body.guests;
    }

    const updated = await Appointments.update(updateData, {
      where: { id: req.params.id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: "No changes made or appointment not found" });
    }

    const updatedAppointment = await Appointments.findByPk(req.params.id);

    res.json({ 
      message: "Updated successfully", 
      data: updatedAppointment 
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointments.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// APPROVE appointment (ADMIN/DEAN)
exports.approveAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    const appointment = await Appointments.findByPk(id);
    if (!appointment) return res.status(404).json({ message: "Not found" });

    // generate secure APT code
    const aptCode = `APT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    appointment.status = "CONFIRMED";
    appointment.aptCode = aptCode;
    // expire at appointment endTime + 1 hour (or choose policy)
    appointment.aptExpiresAt = new Date(new Date(appointment.endTime).getTime() + 60 * 60 * 1000);

    await appointment.save();

    res.json({ message: "Appointment approved", aptCode, aptExpiresAt: appointment.aptExpiresAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REJECT appointment (ADMIN/DEAN)
exports.rejectAppointment = async (req, res) => {
  try {
    const id = req.params.id;
    const appointment = await Appointments.findByPk(id);
    if (!appointment) return res.status(404).json({ message: "Not found" });

    appointment.status = "CANCELLED";
    await appointment.save();

    res.json({ message: "Appointment rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VALIDATE APT code (used by security)
exports.validateApt = async (req, res) => {
  try {
    const { aptCode } = req.body;
    if (!aptCode) return res.status(400).json({ message: "aptCode is required" });

    const appointment = await Appointments.findOne({ where: { aptCode } });
    if (!appointment) return res.status(404).json({ message: "Invalid APT code" });

    const now = new Date();
    if (appointment.status !== "CONFIRMED" || !appointment.aptExpiresAt || new Date(appointment.aptExpiresAt) < now) {
      return res.status(400).json({ message: "APT code expired or appointment invalid" });
    }

    res.json({ valid: true, appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
