import express from "express";
import * as categoryController from "../controllers/Category.js";
import authorize from "../middleware/authorize.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import categoryDataCheck from "../middleware/categoryDataCheck.js";
import isIdValid from "../middleware/isIdValid.js";

const router = express.Router();

// Route to get all categories
router.get("/getAllCategories", authorize, categoryController.getAllCategories);

// Route to add a new category
router.post(
  "/addCategory",
  authorizeAdmin,
  categoryDataCheck,
  categoryController.addCategory
);

// Route to update a category
router.put(
  "/updateCategory/:id",
  authorizeAdmin,
  isIdValid,
  categoryDataCheck,
  categoryController.updateCategory
);

// Route to delete a category
router.delete(
  "/deleteCategory/:id",
  authorizeAdmin,
  isIdValid,
  categoryController.deleteCategory
);

export default router;
