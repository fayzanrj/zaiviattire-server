// Authroization for public use on website
const authorize = (req, res, next) => {
  if (req.headers["accesstoken"] !== process.env.ACCESS_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export default authorize;
