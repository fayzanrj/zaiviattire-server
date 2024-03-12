// Middleware to check for incomplete data in the request body
const categoryDataCheck = (req, res, next) => {
  const { displayName, href, page } = req.body;
  if (!displayName || !href || page === undefined) {
    return res.status(400).json({ message: "Incomplete data" });
  }
  next();
};

export default categoryDataCheck;
