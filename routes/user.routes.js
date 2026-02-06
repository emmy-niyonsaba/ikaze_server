const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const auth = require("../middleware/middleware");
const allow = require("../middleware/roleMiddleware");

// PUBLIC ROUTES
router.post("/signup", controller.register);
router.post("/signin", controller.login);
router.put("/profile", auth, controller.updateUser);
router.get("/me",auth, controller.profile);
// PROTECTED ROUTES
router.get("/", auth, allow("ADMIN"), controller.getUsers);
router.get("/:id", auth, controller.getUser);
router.put("/:id", auth, allow("ADMIN"),controller.updateUser);
router.delete("/:id", auth, allow("ADMIN"),controller.deleteUser);

module.exports = router;
