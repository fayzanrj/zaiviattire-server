import express from "express";
import * as userControllers from "../controllers/User.js";
import authorize from "../middleware/authorize.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import userDataCheck from "../middleware/userDataCheck.js";

const router = express.Router();

// For registering a new user
router.post(
  "/register",
  authorizeAdmin,
  userDataCheck,
  userControllers.registerUser
);

// For logging in
router.post("/login", authorize, userControllers.login);

export default router;
