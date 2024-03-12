// Centralized function to handle internal server errors
const handleIncompleteError = (res) => {
  return res.status(400).json({ message: "Incomplete data" });
};

export default handleIncompleteError;
