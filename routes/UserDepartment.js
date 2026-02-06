// models/userDepartment.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const UserDepartment = sequelize.define("UserDepartment", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    primaryKey: true
  },
  
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    },
    primaryKey: true
  },
  
  role: {
    type: DataTypes.ENUM('HEAD', 'STAFF', 'ASSISTANT', 'INTERN'),
    defaultValue: 'STAFF'
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      canManageAppointments: false,
      canConfirmAppointments: false,
      canViewAll: true,
      canEditDepartmentInfo: false
    }
  }
}, {
  tableName: 'user_departments',
  timestamps: true,
  
  indexes: [
    { fields: ['userId', 'departmentId'], unique: true },
    { fields: ['departmentId'] },
  ]
});

// Associations
UserDepartment.associate = function(models) {
  UserDepartment.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  UserDepartment.belongsTo(models.Department, {
    foreignKey: 'departmentId',
    as: 'department'
  });
};

module.exports = UserDepartment;