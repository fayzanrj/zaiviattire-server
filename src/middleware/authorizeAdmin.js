import { PrismaClient } from "@prisma/client";
import { verifyJwt } from "../libs/Jwt.js";
import handleInternalError from "../libs/handleInternalError.js";
const prisma = new PrismaClient();

// Authorization for users authorized to access website cms
const authorizeAdmin = async (req, res, next) => {
  try {
    if (!req.headers.accesstoken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verifying auth token and getting user data
    const user = await verifyJwt(req.headers.accesstoken);

    // Checking if user exists
    if (user) {
      const userExists = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!userExists) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = user;
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};

export default authorizeAdmin;
