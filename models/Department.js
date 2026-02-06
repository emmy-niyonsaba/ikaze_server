const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Department = sequelize.define("Department", {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: true,
      isUppercase: true
    }
  },
  
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  collegeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  
  // Department head/contact person
  contactUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Department settings
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      appointmentDuration: 60,
      maxDailyAppointments: 20,
      advanceBookingDays: 30,
      requireApproval: false,
      allowedDays: [1, 2, 3, 4, 5], // Mon-Fri
      timeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      isAcceptingAppointments: true
    }
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'For sorting departments in UI'
  }
}, {
  tableName: 'departments',
  timestamps: true,
  
  indexes: [
    { fields: ['collegeId', 'code'], unique: true },
    { fields: ['collegeId', 'name'], unique: true }
  ],
  
  hooks: {
    beforeValidate(department) {
      if (department.code) {
        department.code = department.code.toUpperCase().trim();
      }
    }
  }
});

// Associations
Department.associate = function(models) {
  Department.belongsTo(models.College, {
    foreignKey: 'collegeId',
    as: 'college'
  });
  
  Department.belongsTo(models.User, {
    foreignKey: 'contactUserId',
    as: 'contactPerson'
  });
  
  Department.hasMany(models.Appointment, {
    foreignKey: 'departmentId',
    as: 'appointments'
  });
  
  Department.hasMany(models.UserCollege, {
    foreignKey: 'departmentId',
    as: 'members'
  });
};

module.exports = Department;