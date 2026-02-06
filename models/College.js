// models/college.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const College = sequelize.define("College", {
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isUppercase: true
    }
  },
  
  location: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  
  // The SUPER_ADMIN who created this college
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  
  operatingHours: {
    type: DataTypes.JSON,
    defaultValue: {
      monday: { open: "08:00", close: "17:00" },
      tuesday: { open: "08:00", close: "17:00" },
      wednesday: { open: "08:00", close: "17:00" },
      thursday: { open: "08:00", close: "17:00" },
      friday: { open: "08:00", close: "17:00" },
      saturday: { open: "09:00", close: "13:00" },
      sunday: { open: null, close: null }
    }
  },
  
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      appointmentDuration: 60,
      maxAppointmentsPerDay: 20,
      advanceBookingDays: 30,
      requireApproval: true,
      autoConfirm: false
    }
  },
  
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: "Africa/Kigali"
  }
}, {
  tableName: 'colleges',
  timestamps: true,
  paranoid: true,
  
  indexes: [
    { fields: ['code'], unique: true },
  ],
  
  hooks: {
    beforeValidate(college) {
      if (college.code) {
        college.code = college.code.toUpperCase().trim();
      }
    }
  }
});

// Associations
College.associate = function(models) {
  // College is managed by one user (COLLEGE_MANAGER)
  College.belongsTo(models.User, {
    foreignKey: 'managerId',
    as: 'manager'
  });
  
  // College was created by one user (SUPER_ADMIN)
  College.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  
  // College has many users through junction table
  College.belongsToMany(models.User, {
    through: models.UserCollege,
    foreignKey: 'collegeId',
    as: 'members'
  });
  
  // College has many appointments
  College.hasMany(models.Appointment, {
    foreignKey: 'collegeId',
    as: 'appointments'
  });
  
  // College has many user memberships
  College.hasMany(models.UserCollege, {
    foreignKey: 'collegeId',
    as: 'userMemberships'
  });
  
  // College can have departments
  College.hasMany(models.Department, {
    foreignKey: 'collegeId',
    as: 'departments'
  });
};

// Instance methods
College.prototype.getOperatingHoursForDay = function(day) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[day] || day.toLowerCase();
  return this.operatingHours[dayName];
};

module.exports = College;