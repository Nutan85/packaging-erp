import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET: View all purchase orders
router.get("/", async (req, res, next) => {
  try {
    const [orders] = await pool.query(`
      SELECT po.*,
             s.supplier_name,
             s.company_name,
             p.product_name,
             p.product_code
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN products p ON po.product_id = p.id
      ORDER BY po.id DESC
    `);

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// GET: Load suppliers for dropdown
router.get("/suppliers", async (req, res, next) => {
  try {
    const [suppliers] = await pool.query(
      "SELECT * FROM suppliers ORDER BY supplier_name ASC",
    );

    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
});

// GET: Load products for dropdown
router.get("/products", async (req, res, next) => {
  try {
    const [products] = await pool.query(
      "SELECT id, product_name, product_code, unit_price, price, quantity, stock_quantity FROM products ORDER BY product_name ASC",
    );

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

// POST: Create purchase order
router.post("/", async (req, res, next) => {
  try {
    const {
      order_number,
      supplier_id,
      product_id,
      order_date,
      quantity,
      unit_price,
      status,
    } = req.body;

    if (!order_number || !String(order_number).trim()) {
      return res.status(400).json({
        success: false,
        message: "Order number is required",
      });
    }

    if (!Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a valid supplier",
      });
    }

    if (!Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a valid product",
      });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (
      unit_price === "" ||
      unit_price == null ||
      !Number.isFinite(Number(unit_price)) ||
      Number(unit_price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid unit price",
      });
    }

    const total = Number(quantity) * Number(unit_price);

    const [result] = await pool.query(
      `INSERT INTO purchase_orders
       (order_number, supplier_id, product_id, order_date,
        quantity, unit_price, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(order_number).trim(),
        Number(supplier_id),
        Number(product_id),
        order_date || new Date().toISOString().slice(0, 10),
        Number(quantity),
        Number(unit_price),
        total,
        status || "Pending",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Purchase order number already exists",
      });
    }
    next(error);
  }
});

// PUT: Update purchase order
router.put("/:id", async (req, res, next) => {
  try {
    const {
      order_number,
      supplier_id,
      product_id,
      order_date,
      quantity,
      unit_price,
      status,
    } = req.body;

    if (!order_number || !String(order_number).trim()) {
      return res.status(400).json({
        success: false,
        message: "Order number is required",
      });
    }

    if (!Number.isInteger(Number(supplier_id)) || Number(supplier_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a valid supplier",
      });
    }

    if (!Number.isInteger(Number(product_id)) || Number(product_id) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Select a valid product",
      });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (
      unit_price === "" ||
      unit_price == null ||
      !Number.isFinite(Number(unit_price)) ||
      Number(unit_price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid unit price",
      });
    }

    const total = Number(quantity) * Number(unit_price);

    const [result] = await pool.query(
      `UPDATE purchase_orders
       SET order_number = ?,
           supplier_id = ?,
           product_id = ?,
           order_date = ?,
           quantity = ?,
           unit_price = ?,
           total_amount = ?,
           status = ?
       WHERE id = ?`,
      [
        String(order_number).trim(),
        Number(supplier_id),
        Number(product_id),
        order_date || new Date().toISOString().slice(0, 10),
        Number(quantity),
        Number(unit_price),
        total,
        status || "Pending",
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query(
        "SELECT id FROM purchase_orders WHERE id = ?",
        [req.params.id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Purchase order updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Purchase order number already exists",
      });
    }
    next(error);
  }
});

// DELETE: Delete purchase order
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM purchase_orders WHERE id = ?",
      [req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    res.json({
      success: true,
      message: "Purchase order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
