// middleware/roles.js

// Basic role checker
const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log(req.user.role, " user role")

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

const isSuperAdmin = hasRole('SUPER_ADMIN');
const isCollegeAdmin = hasRole('COLLEGE_MANAGER');
const isDepartmentManager = hasRole('DEPARTMENT_MANAGER'); 
const isSecurityManager = hasRole('SECURITY_MANAGER'); 
const isUser = hasRole('USER');

module.exports = {
  hasRole,
  isSuperAdmin,
  isCollegeAdmin,
  isDepartmentManager,
  isSecurityManager,
  isUser
};