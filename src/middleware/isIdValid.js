import { PrismaClient } from "@prisma/client";
import handleInternalError from "../libs/handleInternalError.js";

// Function to check if the provided ID is valid
const isIdValid = async (req, res, next) => {
  try {
    if (req.params.id.length !== 24) {
      return res.status(400).json({ message: "Invalid id" });
    }

    next();
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

export default isIdValid;
