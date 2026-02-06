// models/userCollege.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const UserCollege = sequelize.define("UserCollege", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    primaryKey: true
  },
  
  collegeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    },
    primaryKey: true
  },
  
  collegeRole: {
    type: DataTypes.ENUM(
      'MANAGER',    
      'STAFF',     
      'SECURITY',   
      'STUDENT',   
      'VISITOR'   
    )
  },
  
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  
  enrollmentNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Custom permissions for this user at this college
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      canCreateAppointments: true,
      canInviteGuests: true,
      maxGuests: 5,
      canViewAllAppointments: false
    }
  }
}, {
  tableName: 'user_colleges',
  timestamps: true,
  
  indexes: [
    { fields: ['userId', 'collegeId'], unique: true },
    { fields: ['collegeId'] },
  ]
});

// Associations
UserCollege.associate = function(models) {
  UserCollege.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  UserCollege.belongsTo(models.College, {
    foreignKey: 'collegeId',
    as: 'college'
  });
  
  UserCollege.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
};

// Instance methods
UserCollege.prototype.isActiveMember = function() {
  return this.isActive && !this.leftAt;
};

module.exports = UserCollege;