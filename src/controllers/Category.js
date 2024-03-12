import { PrismaClient } from "@prisma/client";
import handleInternalError from "../libs/handleInternalError.js";

const prisma = new PrismaClient();

// Function to get all categories
export const getAllCategories = async (req, res) => {
  try {
    // fetching all categories
    const allCategories = await prisma.category.findMany();

    // Response
    res.status(200).json({ categories: allCategories });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to add a new category
export const addCategory = async (req, res) => {
  try {
    // Destructing
    const { displayName, href, page } = req.body;
    // Checking if category exists
    const categoryExists = await prisma.category.findMany({
      where: { OR: [{ displayName }, { href }] },
    });
    if (categoryExists.length > 0) {
      return res.status(409).json({
        message: "A category with this displayName or href already exists",
      });
    }

    // Creating new category
    const newCategory = await prisma.category.create({
      data: { displayName, href: href.replace(/[^a-zA-Z0-9]/g, ""), page },
    });
    if (!newCategory) {
      handleInternalError(res);
    }

    // Response
    res.status(200).json({
      message: "New Category added successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Checking if provided category id exists
    const categoryExists = await prisma.category.findUnique({
      where: { id },
    });
    if (!categoryExists) {
      return res
        .status(404)
        .json({ message: "No category found with this id" });
    }

    // Destructing
    const { displayName, href, page } = req.body;

    // Checking if category exists with new displayname or href provided
    const categoryAlreadyExists = await prisma.category.findFirst({
      where: {
        OR: [{ displayName: displayName }, { href: href }],
      },
    });
    if (categoryAlreadyExists && categoryAlreadyExists.id !== id) {
      return res
        .status(404)
        .json({ message: "A category already exists with this name or href" });
    }

    await prisma.$transaction([
      // Updating the category
      prisma.category.update({
        where: { id },
        data: { displayName, href: href.replace(/[^a-zA-Z0-9]/g, ""), page },
      }),

      // Updating products associated with the category
      prisma.product.updateMany({
        where: { category: categoryExists.href },
        data: { category: href },
      }),
    ]);

    // Response
    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to delete a category
export const deleteCategory = async (req, res) => {
  try {
    // Checking if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: req.params.id },
    });
    if (!existingCategory) {
      return res
        .status(404)
        .json({ message: "No category found with this id" });
    }

    // Deleting category
    const deletedCategory = await prisma.category.delete({
      where: { id: req.params.id },
    });
    if (!deletedCategory) {
      handleInternalError(res);
    }

    // Deleting asssociated products
    const deleteAssociatedProducts = await prisma.product.deleteMany({
      where: {
        category: deletedCategory.href,
      },
    });

    // Response
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};
