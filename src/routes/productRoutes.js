import express from "express";
import authorize from "../middleware/authorize.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import * as productControllers from "../controllers/Products.js";
import { productDataCheck } from "../middleware/productDataCheck.js";
import isIdValid from "../middleware/isIdValid.js";

const router = express.Router();

// For fetching all products
router.get("/getAllProducts", authorize, productControllers.getAllProducts);

// For fetching product by product id
router.get(
  "/getProductByProductId/:productId",
  authorize,
  productControllers.getProductByProductId
);

// For fetching product by design id
router.get(
  "/getProductByDesignId/:designId",
  authorize,
  productControllers.getProductByDesignId
);

// For fetching product by object id
router.get(
  "/getProductById/:id",
  authorize,
  isIdValid,
  productControllers.getProductById
);

// For fetching product by category
router.get(
  "/getProductsByCategory/:category",
  authorize,
  productControllers.getProductsByCategory
);

// For adding a new product
router.post(
  "/addProduct",
  authorizeAdmin,
  productDataCheck,
  productControllers.addProduct
);

// For deleting a product
router.delete(
  "/deleteProduct/:id",
  authorizeAdmin,
  isIdValid,
  productControllers.deleteProduct
);

// For updating a product
router.put(
  "/updateProduct/:id",
  authorizeAdmin,
  isIdValid,
  productDataCheck,
  productControllers.updateProduct
);

router.get("/searchProducts", authorize, productControllers.searchProduct);

export default router;
