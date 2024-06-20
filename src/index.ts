import express, { Request, Response } from "express";
import connectToMongoDB from "./database/Db";
import userRouter from "./routes/user";
import orderRouter from "./routes/order";
import paymentRouter from "./routes/payment";
import productRouter from "./routes/product";
import dashBoardRouter from "./routes/stats";

import dotenv from "dotenv";
import NodeCache from "node-cache";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // allow credentials (cookies)
  })
);

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export const myCache = new NodeCache();

app.use("/api/v1/user", userRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);

app.use("/api/v1/dashboard", dashBoardRouter);

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});
