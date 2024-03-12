import { PrismaClient } from "@prisma/client";
import handleInternalError from "../libs/handleInternalError.js";
import generateOrderNumber from "../libs/GenerateOrderNo.js";

const prisma = new PrismaClient();

// Function to place order
export const placeOrder = async (req, res) => {
  try {
    //Iterating through all product IDS
    for (const item of req.body.items) {
      // Checking if the product exists in the database
      const productExists = await prisma.product.findUnique({
        where: { productId: item.productId },
      });
      // Breaks loop if one of the product doesnt exist
      if (!productExists) {
        return res
          .status(404)
          .send(`Product with ID ${item.productId} does not exist`);
      }
    }

    // Variable to store order number
    let orderNumber;

    await prisma.$transaction(async (prisma) => {
      // Generating order number
      orderNumber = await generateOrderNumber();

      // Create order items directly within the order creation
      const orderItemsData = req.body.items.map((item) => ({
        discount: item.discount,
        total: item.total,
        productDBId: item.productDBId,
        productId: item.productId,
        variant: item.variant,
        orderNumber: orderNumber.toString(),
      }));

      // Checking for variant existence and update quantities within the transaction
      for (const item of req.body.items) {
        const variantExists = await prisma.productVariant.findUnique({
          where: {
            id: item.variant.variantId,
          },
        });

        if (!variantExists || variantExists.quantity < item.variant.quantity) {
          throw new Error("Variant not found or insufficient quantity");
        }

        await prisma.productVariant.update({
          where: {
            id: item.variant.variantId,
          },
          data: {
            quantity: variantExists.quantity - item.variant.quantity,
          },
        });
      }

      // Creating the order along with its embedded order items within the transaction
      const order = await prisma.order.create({
        data: {
          orderId: orderNumber,
          shippingInfo: req.body.shippingInfo,
          total: req.body.total,
          status: "Processing",
          orderItems: {
            create: orderItemsData,
          },
        },
      });

      if (!order) {
        handleInternalError(res);
      }
    });

    // Response
    res.status(200).json({ message: "Order placed succesfully", orderNumber });
  } catch (error) {
    console.error(error);
    if (error.message === "Variant not found or insufficient quantity") {
      res.status(400).json({ message: error.message });
    } else {
      handleInternalError(res);
    }
  }
};

// Function to get an order
export const getOrder = async (req, res) => {
  try {
    // Finding order
    const order = await prisma.order.findUnique({
      where: {
        orderId: req.params.orderId,
      },
      include: {
        orderItems: {
          include: {
            Product: true, // Include products
          },
        },
      },
    });

    // Response
    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    return res.status(409).json({ message: "Error updating status" });
  }
};

// Function to find all orders
export const getAllOrders = async (req, res) => {
  try {
    // Finding orders
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            Product: true, // Including products
          },
        },
      },
    });

    // Response
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    return res.status(409).json({ message: "Error updating status" });
  }
};

// Function to find an order based on status
export const getOrdersByStatus = async (req, res) => {
  try {
    // Checking if query exists
    if (req.query.status === undefined) {
      return res.status(400).json({ message: "Incomplete data" });
    }

    // Finding orders
    const orders = await prisma.order.findMany({
      where: {
        status: req.query.status,
      },
      include: {
        orderItems: {
          include: {
            Product: true, // Including products
          },
        },
      },
    });

    // Response
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    return res.status(409).json({ message: "Error updating status" });
  }
};

// Function to delete an order based on status
export const deleteOrder = async (req, res) => {
  try {
    // Deleting order
    const order = await prisma.order.delete({
      where: {
        orderId: req.params.orderId,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "No order exists with this orderId" });
    }

    // Deleting order items associated with deleted order
    const orderItem = await prisma.orderItem.deleteMany({
      where: {
        orderNumber: req.params.orderId,
      },
    });

    if (!order || !orderItem) {
      return res.status(409).json({ message: "Error deleting order" });
    }

    // Response
    res.status(200).json({ message: "Order has been deleted" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to update the status of an order
export const updateStatus = async (req, res) => {
  try {
    const { newStatus } = req.query;
    const { orderId } = req.params;

    // Updating order status
    if (newStatus === "Cancelled") {
      const order = await prisma.order.update({
        where: {
          orderId: orderId,
        },
        data: {
          status: newStatus,
          cancelReason: req.body.cancelReason,
          trackingId: "",
        },
      });
    } else if (newStatus === "Dispatched") {
      const order = await prisma.order.update({
        where: {
          orderId: orderId,
        },
        data: {
          status: newStatus,
          trackingId: req.body.trackingId,
        },
      });
    } else if (newStatus === "Delivered") {
      const order = await prisma.order.update({
        where: {
          orderId: orderId,
        },
        data: {
          status: newStatus,
        },
      });
    } else {
      const order = await prisma.order.update({
        where: {
          orderId: orderId,
        },
        data: {
          status: newStatus,
          cancelReason: "",
          trackingId: "",
        },
      });
    }

    // Response
    res
      .status(200)
      .json({ message: `Order#${orderId} has been marked as ${newStatus}` });
  } catch (error) {
    console.error(error);
    return res.status(409).json({ message: "Error updating status" });
  }
};

// Function to get status of an order
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Finding order
    const order = await prisma.order.findUnique({
      where: {
        orderId,
      },
    });

    // Response
    return res.status(200).json({
      order: {
        status: order.status,
        cancelReason: order.cancelReason,
        updatedAt: order.updatedAt,
        createdAt: order.createdAt,
        customerName:
          order.shippingInfo.firstName + " " + order.shippingInfo.lastName,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(409).json({ message: "Error fetching status" });
  }
};
