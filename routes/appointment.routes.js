const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointmentController");
const auth = require("../middleware/middleware");
const allow = require("../middleware/roleMiddleware");

router.post("/create", auth, controller.createAppointment);
router.get("/", auth, controller.getAppointments);
router.get("/pending", auth, controller.getPendingAppointments);
router.get("/mine", auth, controller.getMyAppointments);

router.get("/:id", auth, controller.getAppointment);
router.get("/verify/:ref", auth, controller.getAppointmentByRef);

router.put("/:id", auth, controller.updateAppointment);
router.delete("/:id", auth, controller.deleteAppointment);

router.post("/:id/approve", auth, allow("ADMIN","DEAN"), controller.approveAppointment);
router.post("/:id/reject", auth, allow("ADMIN","DEAN"), controller.rejectAppointment);

// Security validation
router.post("/validate", auth, allow("SECURITY","ADMIN","DEAN"), controller.validateApt);

module.exports = router;
    