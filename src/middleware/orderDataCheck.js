// Order variant checking
const isValidVariant = (variant) => {
  const { variantId, color, quantity, size } = variant;
  return (
    color &&
    typeof color === "object" &&
    typeof color.name === "string" &&
    typeof color.hexCode === "string" &&
    typeof quantity === "number" &&
    typeof size === "string" &&
    typeof variantId === "string" &&
    variantId.length === 24
  );
};

const checkOrderData = async (req, res, next) => {
  const { items, shippingInfo } = req.body;
  // Checking if items array exists and is not empty
  if (!items || !shippingInfo || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Incomplete data" });
  }

  // Checking if shippingInfo object exists and has required fields
  const { address, city, email, firstName, lastName, phoneNumber, zip } =
    shippingInfo;
  if (
    !address ||
    !city ||
    !email ||
    !firstName ||
    !lastName ||
    !phoneNumber ||
    !zip
  ) {
    return res.status(400).json({ message: "Incomplete data" });
  }

  // Checking each item in the items array
  for (const item of items) {
    const { discount, productDBId, variant, total } = item;
    // Checking if all required fields in the item object exist and are of correct types
    if (
      typeof discount !== "number" ||
      typeof productDBId !== "string" ||
      typeof total !== "number" ||
      !variant ||
      !isValidVariant(variant)
    ) {
      return res.status(400).json({ message: "Incomplete data" });
    }
  }

  next();
};

export default checkOrderData;
