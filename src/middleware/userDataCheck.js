// Middleware to check for incomplete data in the request body
const userDataCheck = (req, res, next) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Incomplete data" });
  }
  next();
};

export default userDataCheck;
