import express from "express";
import * as orderControllers from "../controllers/Orders.js";
import authorize from "../middleware/authorize.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import checkOrderData from "../middleware/orderDataCheck.js";
import isValidOrderId from "../middleware/isValidOrderId.js";

const router = express.Router();

// For creating/placing order
router.post(
  "/placeOrder",
  authorize,
  checkOrderData,
  orderControllers.placeOrder
);

// For getting a specific order
router.get(
  "/getOrder/:orderId",
  authorizeAdmin,
  isValidOrderId,
  orderControllers.getOrder
);

// For getting all orders
router.get("/getAllOrders", authorizeAdmin, orderControllers.getAllOrders);

// For getting orders by status, filtering
router.get(
  "/getOrdersByStatus",
  authorizeAdmin,
  orderControllers.getOrdersByStatus
);

// For deleting orders
router.delete(
  "/deleteOrder/:orderId",
  authorizeAdmin,
  isValidOrderId,
  orderControllers.deleteOrder
);

// For updating order
router.put(
  "/updateStatus/:orderId",
  authorizeAdmin,
  isValidOrderId,
  orderControllers.updateStatus
);

// For getting specific order status
router.get(
  "/getOrderStatus/:orderId",
  authorize,
  isValidOrderId,
  orderControllers.getOrderStatus
);

export default router;
