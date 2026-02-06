// routes/security.routes.js
const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { authenticate } = require('../middleware/auth');
const { isSecurity } = require('../middleware/roles');

// 1. Check-in appointment
router.post('/checkin/:appointmentId', 
  authenticate, 
  isSecurity,
  securityController.checkInAppointment
);

// 2. Check-out appointment  
router.post('/checkout/:appointmentId',
  authenticate,
  isSecurity,
  securityController.checkOutAppointment
);

// 3. Get appointments handled by security (checked in/out)
router.get('/my-appointments',
  authenticate,
  isSecurity,
  securityController.getMyHandledAppointments
);

// 4. Get today's appointments for check-in
router.get('/today-appointments',
  authenticate,
  isSecurity,
  securityController.getTodayAppointments
);

// 5. Verify appointment code (for walk-ins)
router.post('/verify-code',
  authenticate,
  isSecurity,
  securityController.verifyAppointmentCode
);

module.exports = router;