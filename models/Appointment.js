const { DataTypes } = require("sequelize");
const sequelize = require("../config/index");

const Appointment = sequelize.define("Appointment", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  type: {
    type: DataTypes.ENUM('MEETING', 'INTERVIEW', 'CONSULTATION', 'VISIT', 'OTHER'),
    allowNull: false,
    defaultValue: 'MEETING'
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: true
    // Unique constraint moved to indexes block below
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true
    }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStart(value) {
        if (value <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  collegeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'colleges',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  departmentName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
    defaultValue: 'MEDIUM'
  },
  attachmentUrls: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  guests: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
    defaultValue: 'PENDING'
  },
  aptCode: {
    type: DataTypes.STRING,
    allowNull: true
    // Unique constraint moved to indexes block below
  },
  aptExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkedInBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  checkedOutAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkedOutBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  paranoid: true,
  
  // Named indexes to prevent MySQL ER_TOO_MANY_KEYS (Limit 64)
  indexes: [
    { name: 'unique_apt_reference', unique: true, fields: ['referenceNumber'] },
    { name: 'unique_apt_code', unique: true, fields: ['aptCode'] }
  ],
  
  hooks: {
    beforeCreate(appointment) {
      if (!appointment.referenceNumber) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        appointment.referenceNumber = `APT-${timestamp}-${random}`;
      }
    },
    
    async afterCreate(appointment) {
      if (!appointment.aptCode) {
        const year = new Date().getFullYear().toString().slice(-2);
        const id = appointment.id.toString().padStart(6, '0');
        const generatedCode = `APT${year}${id}`;
        // Use update with hooks:false to prevent recursion
        await appointment.update({ aptCode: generatedCode }, { hooks: false });
      }
    }
  }
});

// Associations
Appointment.associate = function(models) {
  Appointment.belongsTo(models.College, { foreignKey: 'collegeId', as: 'college' });
  Appointment.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Appointment.belongsTo(models.User, { foreignKey: 'checkedInBy', as: 'checkInUser' });
  Appointment.belongsTo(models.User, { foreignKey: 'checkedOutBy', as: 'checkOutUser' });
  Appointment.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'appointmentDepartment' });
};

module.exports = Appointment;