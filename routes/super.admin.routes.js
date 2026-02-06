// routes/manage.users.routes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/middleware');
const { 
  isSuperAdmin, 
  isCollegeAdmin, 
  isDepartmentManager, 
  isSecurityManager 
} = require('../middleware/role');

const superAdminController = require("../controllers/superAdminController")


// 1. Create new college
router.post('/colleges',
  authenticate,
  isSuperAdmin,
  superAdminController.createCollege
);

// 2. Get all colleges
router.get('/colleges',
  authenticate,
  isSuperAdmin,
  superAdminController.getAllColleges
);

// 3. Get specific college
router.get('/colleges/:id',
  authenticate,
  isSuperAdmin,
  superAdminController.getCollege
);

// 4. Update college
router.put('/colleges/:id',
  authenticate,
  isSuperAdmin,
  superAdminController.updateCollege
);

// 5. Delete college (soft delete)
router.delete('/colleges/:id',
  authenticate,
  isSuperAdmin,
  superAdminController.deleteCollege
);




// College Admin Management
// 6. Create college admin
router.post('/college-admins',
  authenticate,
  isSuperAdmin,
  superAdminController.createCollegeAdmin
);

// 7. Get all college admins
router.get('/college-admins',
  authenticate,
  isSuperAdmin,
  superAdminController.getAllCollegeAdmins
);

router.get('/stats/summary', superAdminController.getCollegeStats);

// // 8. Assign admin to college
// router.post('/assign-admin-to-college',
//   authenticate,
//   isSuperAdmin,
//   superAdminController.assignAdminToCollege
// );

// // 9. Remove admin from college
// router.delete('/colleges/:collegeId/admin/:adminId',
//   authenticate,
//   isSuperAdmin,
//   superAdminController.removeAdminFromCollege
// );




module.exports = router;