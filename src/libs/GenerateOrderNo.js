import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const generateOrderNumber = async () => {
  const timestamp = new Date().getTime().toString();
  const firstTwoDigits = timestamp.substring(0, 2);
  const lastSixDigits = timestamp.substring(timestamp.length - 6);
  const eightDigitNumber = `${firstTwoDigits}${lastSixDigits}`;

  // Checking if generated order number already exists
  const orderNumberExists = await prisma.order.findUnique({
    where: { orderId: eightDigitNumber },
  });

  if (orderNumberExists) {
    return generateOrderNumber();
  } else {
    return eightDigitNumber;
  }
};

export default generateOrderNumber;
