import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET: View all products
router.get("/", async (req, res, next) => {
  try {
    const [products] = await pool.query(
      "SELECT * FROM products ORDER BY id DESC",
    );

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// POST: Add a product
router.post("/", async (req, res, next) => {
  try {
    const { product_name, product_code, category, price, stock_quantity } =
      req.body;

    if (!product_name || !product_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (
      price == null ||
      price === "" ||
      Number(price) < 0 ||
      !Number.isFinite(Number(price))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid non-negative price",
      });
    }

    if (
      stock_quantity == null ||
      stock_quantity === "" ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO products
       (product_name, product_code, category, price, stock_quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [
        product_name.trim(),
        product_code || null,
        category || null,
        Number(price),
        Number(stock_quantity),
      ],
    );

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Product code already exists",
      });
    }
    next(error);
  }
});

// PUT: Update a product
router.put("/:id", async (req, res, next) => {
  try {
    const { product_name, product_code, category, price, stock_quantity } =
      req.body;

    if (!product_name || !product_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (
      price == null ||
      price === "" ||
      Number(price) < 0 ||
      !Number.isFinite(Number(price))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid non-negative price",
      });
    }

    if (
      stock_quantity == null ||
      stock_quantity === "" ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a non-negative whole number",
      });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET product_name = ?, product_code = ?, category = ?,
           price = ?, stock_quantity = ?
       WHERE id = ?`,
      [
        product_name.trim(),
        product_code || null,
        category || null,
        Number(price),
        Number(stock_quantity),
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query("SELECT id FROM products WHERE id = ?", [
        req.params.id,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Product code already exists",
      });
    }
    next(error);
  }
});

// DELETE: Remove a product
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
