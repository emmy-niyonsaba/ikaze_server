const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/middleware');
const { 
  isSuperAdmin, 
  isCollegeAdmin, 
  isDepartmentManager, 
  isSecurityManager 
} = require('../middleware/role');

const departmentController = require("../controllers/departController");

// --- Department Info & Stats ---
router.get('/info', 
  authenticate, 
  isDepartmentManager, 
  departmentController.getDepartmentInfo
);

router.get('/dashboard-stats', 
  authenticate, 
  isDepartmentManager, 
  departmentController.getDashboardStats
);

// --- Appointment Management (Specific to Department context) ---
router.get('/appointments', 
  authenticate, 
  isDepartmentManager, 
  departmentController.getDepartmentAppointments
);



router.post('/appointments/:id/approve', 
  authenticate, 
  isDepartmentManager, 
  departmentController.approveAppointment
);

router.post('/appointments/:id/reject', 
  authenticate, 
  isDepartmentManager, 
  departmentController.rejectAppointment
);

router.post('/appointments/:id/cancel', 
  authenticate, 
  isDepartmentManager, 
  departmentController.cancelAppointment
);

// --- Student Requests / Approvals ---
router.get('/pending-approvals', 
  authenticate, 
  isDepartmentManager, 
  departmentController.getPendingApprovals
);

router.post('/approvals/:id/approve', 
  authenticate, 
  isDepartmentManager, 
  departmentController.approveStudentRequest
);



// --- Reports ---
router.get('/reports', 
  authenticate, 
  isDepartmentManager, 
  departmentController.getDepartmentReports
);

module.exports = router;