import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/products", productsRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB 연결 성공");
    app.listen(process.env.PORT || 3000, () => {
      console.log("서버 시작! http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB 연결 실패", err?.message ?? "알 수 없는 오류");
    process.exit(1);
  });
