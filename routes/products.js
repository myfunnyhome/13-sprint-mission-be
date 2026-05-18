import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// 상품 목록 조회
router.get("/", async (req, res) => {
  try {
    const { keyword, orderBy, page = 1, pageSize = 10 } = req.query;

    const where = {};
    if (keyword) {
      where.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const orderOption =
      orderBy === "recent" ? { createdAt: -1 } : { createdAt: 1 };

    const offset = (Number(page) - 1) * Number(pageSize);
    const totalCount = await Product.countDocuments(where);
    const products = await Product.find(where)
      .sort(orderOption)
      .skip(offset)
      .limit(Number(pageSize))
      .select("name price createdAt");

    res.status(200).json({ list: products, totalCount });
  } catch (err) {
    res.status(500).json({ message: err?.message ?? "알 수 없는 오류" });
  }
});

// 상품 등록
router.post("/", async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = new Product({ name, description, price, tags });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err?.message ?? "알 수 없는 오류" });
  }
});

// 상품 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select(
      "name description price tags createdAt",
    );
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err?.message ?? "알 수 없는 오류" });
  }
});

// 상품 수정
router.patch("/:id", async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    const product = await Product.findByInANdUpdate(
      req.params.id,
      { name, description, price, tags },
      { new: true, runValidators: true },
    );
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err?.message ?? "알 수 없는 오류" });
  }
});

// 상품 삭제
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "상품이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ message: err?.message ?? "알 수 없는 오류" });
  }
});

export default router;
