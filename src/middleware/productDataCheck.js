import handleInternalError from "../libs/handleInternalError.js";

export const productDataCheck = async (req, res, next) => {
  try {
    // Destructuring the request body
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
      productImages,
      variants,
    } = req.body.product;

    // Checking for missing or empty required fields
    if (
      !productId ||
      !designId ||
      !productTitle ||
      !productDesc ||
      !category ||
      !composition ||
      !gsm ||
      !washCare ||
      !price ||
      productImages.length <= 0 ||
      variants.length <= 0
    ) {
      const missingFields = [];
      if (!productId) missingFields.push("productId");
      if (!designId) missingFields.push("designId");
      if (!productTitle) missingFields.push("productTitle");
      if (!productDesc) missingFields.push("productDesc");
      if (!category) missingFields.push("category");
      if (!composition) missingFields.push("composition");
      if (!gsm) missingFields.push("gsm");
      if (!washCare) missingFields.push("washCare");
      if (!price) missingFields.push("price");
      if (productImages.length <= 0) missingFields.push("productImages");
      if (variants.length <= 0) missingFields.push("variants");

      return res
        .status(400)
        .json({ message: `Incomplete data ${missingFields}` });
    }

    for (const variant of variants) {
      const { size, quantity, color } = variant;

      if (!size || !quantity || !color || !color.name || !color.hexCode) {
        return res.status(400).json({ message: "Invalid variant data" });
      }
    }

    next();
  } catch (error) {
    console.error("Error in productDataCheck middleware:", error);
    handleInternalError(res);
  }
};
