import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { getStats } from "./src/controllers/Stats.js";
import authorizeAdmin from "./src/middleware/authorizeAdmin.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();

const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "35mb" }));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "35mb",
    parameterLimit: 50000,
  })
);

app.use(cors());
app.use(express.json());

app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stats/getStats", authorizeAdmin, getStats);
app.use("/", (req, res) => {
  res.status(200).json({ message: "API working" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
