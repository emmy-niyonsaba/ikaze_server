const sequelize = require("../config/index");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");

async function runSeed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const adminPassword = await bcrypt.hash("password123", 10);
    const securityPassword = await bcrypt.hash("password123", 10);

    const [admin] = await User.findOrCreate({
      where: { email: "admin@ikaze.local" },
      defaults: {
        firstName: "Admin",
        lastName: "User",
        phone: "0000000000",
        email: "admin@ikaze.local",
        password: adminPassword,
        rpCollege: "RPTUMBA",
        role: "ADMIN",
      },
    });

    const [security] = await User.findOrCreate({
      where: { email: "security@ikaze.local" },
      defaults: {
        firstName: "Security",
        lastName: "Guard",
        phone: "1111111111",
        email: "security@ikaze.local",
        password: securityPassword,
        rpCollege: "RPTUMBA",
        role: "SECURITY",
      },
    });

    // create a sample pending appointment
    const [appt] = await Appointment.findOrCreate({
      where: { description: "Sample visitor appointment for demo" },
      defaults: {
        type: "VISIT",
        startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        description: "Sample visitor appointment for demo",
        rpCollege: "RPTUMBA",
        department: "GENERAL",
        attachmentUrls: [],
        guests: [{ fullname: "Demo Visitor", id: "ID123" }],
        UserId: admin.id,
      },
    });

    console.log("Seed complete:", { admin: admin.email, security: security.email, sampleAppointmentId: appt.id });
    process.exit(0);
  } catch (err) {
    console.error("Seed failed", err);
    process.exit(1);
  }
}

runSeed();