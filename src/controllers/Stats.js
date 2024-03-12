import { PrismaClient } from "@prisma/client";
import handleInternalError from "../libs/handleInternalError.js";
const prisma = new PrismaClient();

export const getStats = async (req, res) => {
  try {
    // Last thirty days date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetching orders from last 30 days
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    let pendingOrder = 0;
    let processingOrders = 0;
    let cancelledOrders = 0;
    let confirmedOrders = 0;
    let dispatchedOrders = 0;
    let deliveredOrders = 0;
    let totalSales = 0;
    let totalOrders = 0;

    // Looping throw each order
    orders.forEach((order) => {
      if (order.status === "Pending") pendingOrder++;
      if (order.status === "Processing") processingOrders++;
      if (order.status === "Confirmed") confirmedOrders++;
      if (order.status === "Dispatched") dispatchedOrders++;
      if (order.status === "Delivered") deliveredOrders++;
      if (order.status === "Cancelled") cancelledOrders++;

      if (order.status !== "Cancelled") {
        totalSales += order.total;
        totalOrders++;
      }
    });

    // Counting total number of products
    const totalProducts = await prisma.product.count();

    // Findong all categories
    const categories = await prisma.category.findMany({});

    // Finding products count for each category
    const statsCategories = await Promise.all(
      categories.map(async (category) => {
        const products = await prisma.product.count({
          where: {
            category: category.href,
          },
        });

        return {
          ...category,
          productCount: products,
        };
      })
    );

    // Response
    res.status(200).json({
      stats: {
        orders: {
          totalOrders: orders.length,
          pendingOrder,
          processingOrders,
          cancelledOrders,
          confirmedOrders,
          dispatchedOrders,
          deliveredOrders,
        },
        sales: {
          totalSales,
          totalOrders: totalOrders,
        },
        products: {
          totalProducts,
        },
        categories: statsCategories,
      },
    });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};
