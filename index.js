require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const userRoutes = require("./routes/user.routes")
const appointmentRoutes = require("./routes/appointment.routes")
const superAdminRoutes = require("./routes/super.admin.routes")

const collegeManagerRoutes = require("./routes/college.manager.routes")
const departmentManagerRoutes = require("./routes/depart.manager.routes")
const { syncDatabase, seedDatabase } = require('./models/index');



// parse urlencoded bodies and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

app.use("/api/users",userRoutes)
app.use("/api/appointment", appointmentRoutes)
app.use("/api/super-admin", superAdminRoutes)
app.use("/api/college-manager", collegeManagerRoutes)
app.use("/api/department", departmentManagerRoutes)

app.get("/api/system/health", async (req, res) => {
  const healthStatus = {
    status: "Optimal",
    timestamp: new Date(),
    services: {
      api: "Optimal",
      database: "Optimal",
      storage: "Checking..."
    }
  };

  try {
    // Check Database connection
    const { sequelize } = require('./models');
    await sequelize.authenticate();
  } catch (error) {
    healthStatus.status = "Degraded";
    healthStatus.services.database = "Down";
  }

  // Basic Storage check (Node.js built-in)
  const os = require('os');
  const freeMem = (os.freemem() / os.totalmem() * 100).toFixed(0);
  healthStatus.services.storage = `${freeMem}% Free`;

  res.json({ success: true, data: healthStatus });
});



const startServer = async () => {
  try {
    // 1. Sync database (create tables)
    await syncDatabase();
    
    // 2. Seed data
    // await seedDatabase();
    const PORT = 5000;
    // 3. Start server
    app.listen(PORT, () => {
      console.log(`APP IS RUNNING ON PORT ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

