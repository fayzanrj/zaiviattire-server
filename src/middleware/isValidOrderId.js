const isValidOrderId = (req, res, next) => {
  if (req.params.orderId.length !== 8) {
    return res
      .status(404)
      .json({ message: "No order found with provided order#" });
  }

  next();
};

export default isValidOrderId;
