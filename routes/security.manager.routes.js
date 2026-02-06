


// ==================== SECURITY_MANAGER ROUTES ====================

// Security Personnel CRUD
// 18. Create security personnel
router.post('/security-personnel',
  authenticate,
  isSecurityManager,
  manageUsersController.createSecurityPersonnel
);

// 19. Get all security personnel
router.get('/security-personnel',
  authenticate,
  isSecurityManager,
  manageUsersController.getAllSecurityPersonnel
);

// 20. Get specific security personnel
router.get('/security-personnel/:id',
  authenticate,
  isSecurityManager,
  manageUsersController.getSecurityPersonnel
);

// 21. Update security personnel
router.put('/security-personnel/:id',
  authenticate,
  isSecurityManager,
  manageUsersController.updateSecurityPersonnel
);

// 22. Delete security personnel
router.delete('/security-personnel/:id',
  authenticate,
  isSecurityManager,
  manageUsersController.deleteSecurityPersonnel
);

// 23. Update security shift
router.put('/security-personnel/:id/shift',
  authenticate,
  isSecurityManager,
  manageUsersController.updateSecurityShift
);

// 24. Get security reports
router.get('/security-reports',
  authenticate,
  isSecurityManager,
  manageUsersController.getSecurityReports
);