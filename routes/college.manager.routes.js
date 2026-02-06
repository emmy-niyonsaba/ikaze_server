const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/middleware');
const { isCollegeAdmin } = require('../middleware/role');
const collegeManagerController = require("../controllers/collegeManagerController");

router.get('/dashboard-stats',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.getCollegeDashboardStats
);

router.get('/my-college',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.getMyCollegeProfile
);

router.post('/new-manager',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.createUserAccount
);

router.get('/department-managers',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.getCollegeDepartmentManagers
);

router.get('/departments',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.getCollegeDepartments
);


router.post('/departments',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.createDepartments
);



router.get('/users',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.getCollegeUsers
);

router.put('/users/:userId/status',
  authenticate,
  isCollegeAdmin,
  collegeManagerController.updateUserStatus
);

module.exports = router;