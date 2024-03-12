import jwt from "jsonwebtoken";

// Function to sign access token
export function signJwtAccessToken(payload) {
  const secret_key = process.env.JWT_SECRET_KEY;
  const token = jwt.sign(payload, secret_key);
  return token;
}

// Function to verify access token
export function verifyJwt(token) {
  try {
    const secret_key = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
}
