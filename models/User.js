const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const User = sequelize.define("User", {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 50]
    }
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true removed to prevent ER_TOO_MANY_KEYS
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [8, 100]
    }
  },

  role: {
    type: DataTypes.ENUM(
      "SUPER_ADMIN",
      "COLLEGE_MANAGER",
      "DEPARTMENT_MANAGER",
      "SECURITY_MANAGER",
      "SECURITY",
      "USER"
    ),
    defaultValue: "USER"
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,

  // Using explicit index names prevents MySQL from creating 64+ keys
  indexes: [
    { name: 'users_email_unique', fields: ['email'], unique: true },
  ],

  defaultScope: {
    attributes: { exclude: ['password'] }
  },

  scopes: {
    withPassword: {
      attributes: { include: ['password'] }
    },
    active: {
      where: { isActive: true }
    }
  }
});

// Associations
User.associate = function (models) {
  User.hasOne(models.College, {
    foreignKey: 'managerId',
    as: 'managedCollege'
  });

  User.hasMany(models.College, {
    foreignKey: 'createdBy',
    as: 'createdColleges'
  });

  User.belongsToMany(models.College, {
    through: models.UserCollege,
    foreignKey: 'userId',
    as: 'colleges'
  });

  User.hasMany(models.Appointment, {
    foreignKey: 'createdBy',
    as: 'createdAppointments'
  });

  User.hasMany(models.Appointment, {
    foreignKey: 'checkedInBy',
    as: 'checkedInAppointments'
  });

  User.hasMany(models.Appointment, {
    foreignKey: 'checkedOutBy',
    as: 'checkedOutAppointments'
  });

  User.hasMany(models.UserCollege, {
    foreignKey: 'userId',
    as: 'collegeMemberships'
  });
};

// Instance methods
User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.isSuperAdmin = function () {
  return this.role === 'SUPER_ADMIN';
};

User.prototype.isCollegeManager = function () {
  return this.role === 'COLLEGE_MANAGER';
};

module.exports = User;