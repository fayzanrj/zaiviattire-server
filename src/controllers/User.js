import { PrismaClient } from "@prisma/client";
import { signJwtAccessToken } from "../libs/Jwt.js";
import bcrypt from "bcryptjs";
import handleInternalError from "../libs/handleInternalError.js";
const prisma = new PrismaClient();

// Function to register a new user
export const registerUser = async (req, res) => {
  try {
    // Destructing
    const { username, email, password, role } = req.body;

    // Checking is user exists with provided data
    const [usernameTaken, emailTaken] = await Promise.all([
      prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      }),
      prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      }),
    ]);

    if (usernameTaken) {
      return res.status(400).json({ message: "Username already taken" });
    }

    if (emailTaken) {
      return res.status(400).json({ message: "Email already taken" });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    // Registering new user
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        role: role.toLowerCase(),
        password: hashedPass,
      },
    });

    if (!newUser) {
      return handleInternalError(res);
    }

    // Response
    return res.status(200).json({ message: "User has been added" });
  } catch (error) {
    console.error(error);
    return handleInternalError(res);
  }
};

// Function to log in user
export const login = async (req, res) => {
  try {
    // Destructing and checking data
    const { username, password } = req.body;
    if (!username && !password) {
      return res.status(400).json({ message: "Incomplete data" });
    }

    // Finding user
    const userExists = await prisma.user.findUnique({
      where: { username },
    });
    if (!userExists) {
      return res
        .status(403)
        .json({ message: "Login failed! Please check your credentials" });
    }

    // Comparing password
    const isPasswordCorrect = bcrypt.compareSync(password, userExists.password);

    if (!isPasswordCorrect) {
      return res
        .status(403)
        .json({ message: "Login failed! Please check your credentials" });
    }

    const user = {
      id: userExists.id,
      username: userExists.username,
      email: userExists.email,
      role: userExists.role,
    };

    // Signing jwt token
    const accessToken = await signJwtAccessToken(user);

    // Response
    res.status(200).json({
      message: "Login successfully, redirecting you to dashboard",
      user,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    handleInternalError(res);
  }
};
