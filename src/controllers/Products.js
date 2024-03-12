import { PrismaClient } from "@prisma/client";
import handleInternalError from "../libs/handleInternalError.js";
import cloudinary from "cloudinary";

const prisma = new PrismaClient();

// Unified function to find a product based on the field
const findProductByField = async (field, value, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { [field]: value },
      include: { variants: true },
    });

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to get all the products
export const getAllProducts = async (req, res) => {
  try {
    // Finding products
    const products = await prisma.product.findMany({
      include: { variants: true },
    });

    // Response
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to get product based on product ID
export const getProductByProductId = async (req, res) => {
  await findProductByField("productId", req.params.productId, res);
};

// Function to get product based on design ID
export const getProductByDesignId = async (req, res) => {
  await findProductByField("designId", req.params.designId, res);
};

// Function to get product based on ID
export const getProductById = async (req, res) => {
  await findProductByField("id", req.params.id, res);
};

// Function to get products according to their category
export const getProductsByCategory = async (req, res) => {
  try {
    // Finding products
    const products = await prisma.product.findMany({
      where: { category: req.params.category },
      include: { variants: true },
    });

    // Response
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to delete order
export const deleteProduct = async (req, res) => {
  try {
    // Checking if product exists and getting its variants
    const productToDelete = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true },
    });
    if (!productToDelete) {
      return res.status(404).json({ message: "No product found" });
    }

    // Getting productToDelete variant's ids
    const variantIds = productToDelete.variants.map((variant) => variant.id);

    // Deleting all productVariants and product as well
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } }),
      prisma.product.delete({ where: { id: req.params.id } }),
    ]);

    // Response
    res.status(200).json({ message: "Product has been deleted successfully" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

// Function to add product
export const addProduct = async (req, res) => {
  try {
    const data = req.body.product;

    // Checking if category provided exists
    const categoryExists = await prisma.category.findUnique({
      where: { href: data.category },
    });
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Checking if product with provided productID or designID already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [{ productId: data.productId }, { designId: data.designId }],
      },
    });
    if (existingProduct) {
      const conflictField =
        existingProduct.productId === data.productId
          ? "product ID"
          : "design ID";
      return res.status(409).json({
        message: `A product with this ${conflictField} already exists`,
      });
    }

    // Uploading product images
    const productImagesPromises = data.productImages.map(async (image) => {
      try {
        const result = await cloudinary.v2.uploader.upload(image, {
          resource_type: "image",
        });
        return result.secure_url;
      } catch (error) {
        console.error("Error uploading product image:", error);
        throw error;
      }
    });

    // Waiting for all image uploads to finish
    const productImageURLs = await Promise.all(productImagesPromises);

    // Creating product data
    const productData = {
      ...data,
      productImages: productImageURLs,
      variants: {
        create: data.variants,
      },
    };

    // Creating product in database
    const product = await prisma.product.create({ data: productData });

    // Response
    res.status(200).json({ message: "Product has been added" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

export const updateProduct = async (req, res) => {
  // Destructing
  const {
    productId,
    designId,
    productTitle,
    productDesc,
    category,
    composition,
    gsm,
    washCare,
    price,
    discount,
    gender,
    productImages,
    variants,
  } = req.body.product;

  try {
    // Checking for existing product IDs
    const [productIdExists, designIdExists, categoryExists] = await Promise.all(
      [
        prisma.product.findFirst({
          where: { productId, id: { not: req.params.id } },
        }),
        prisma.product.findFirst({
          where: { designId, id: { not: req.params.id } },
        }),
        prisma.category.findUnique({ where: { href: category } }),
      ]
    );

    // Checking if product with provided productID or designID already exists
    if (productIdExists) {
      return res.status(409).json({
        message: "A product with this product ID already exists",
      });
    }
    if (designIdExists) {
      return res.status(409).json({
        message: "A product with this design ID already exists",
      });
    }
    // Checking if category provided exists
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Uploading product images
    const productImagesPromises = productImages.map(async (image) => {
      try {
        const result = await cloudinary.v2.uploader.upload(image, {
          resource_type: "image",
        });
        return result.secure_url;
      } catch (error) {
        console.error("Error uploading product image:", error);
        throw error;
      }
    });

    // Waiting for all image uploads to finish
    const productImageURLs = await Promise.all(productImagesPromises);

    // Starting a transaction to update the product and its variants
    await prisma.$transaction([
      // Update the product
      prisma.product.update({
        where: { id: req.params.id },
        data: {
          productId,
          designId,
          productTitle,
          productDesc,
          category,
          composition,
          gsm,
          washCare,
          price,
          discount,
          gender,
          productImages: { set: productImageURLs },
          variants: {
            deleteMany: {},
            create: variants.map((variant) => ({
              size: variant.size,
              quantity: variant.quantity,
              color: {
                name: variant.color.name,
                hexCode: variant.color.hexCode,
              },
            })),
          },
        },
      }),
      // Update order items referencing this product
      prisma.orderItem.updateMany({
        where: { productDBId: req.params.id },
        data: { productId },
      }),
    ]);

    // Response
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

//  Function to search products
export const searchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    // Searching products
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          {
            productId: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            productTitle: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        variants: true,
      },
    });

    // Response
    res.status(200).json({ products: searchResults });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};
