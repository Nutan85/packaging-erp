import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET: View all sales orders
router.get("/", async (req, res, next) => {
  try {
    const [orders] = await pool.query(`
      SELECT so.*, c.customer_name, c.company_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      ORDER BY so.id DESC
    `);

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// POST: Create sales order
router.post("/", async (req, res, next) => {
  try {
    const { order_number, customer_id, order_date, total_amount, status } =
      req.body;

    if (!order_number || !String(order_number).trim()) {
      return res.status(400).json({
        success: false,
        message: "Order number is required",
      });
    }

    if (!customer_id || !Number.isInteger(Number(customer_id))) {
      return res.status(400).json({
        success: false,
        message: "Select a valid customer",
      });
    }

    if (
      total_amount == null ||
      total_amount === "" ||
      !Number.isFinite(Number(total_amount)) ||
      Number(total_amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid total amount",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO sales_orders
       (order_number, customer_id, order_date, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(order_number).trim(),
        Number(customer_id),
        order_date || new Date().toISOString().slice(0, 10),
        Number(total_amount),
        status || "Pending",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Order number already exists",
      });
    }
    next(error);
  }
});

// PUT: Update sales order
router.put("/:id", async (req, res, next) => {
  try {
    const { order_number, customer_id, order_date, total_amount, status } =
      req.body;

    if (!order_number || !String(order_number).trim()) {
      return res.status(400).json({
        success: false,
        message: "Order number is required",
      });
    }

    if (!customer_id || !Number.isInteger(Number(customer_id))) {
      return res.status(400).json({
        success: false,
        message: "Select a valid customer",
      });
    }

    if (
      total_amount == null ||
      total_amount === "" ||
      !Number.isFinite(Number(total_amount)) ||
      Number(total_amount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid total amount",
      });
    }

    const [result] = await pool.query(
      `UPDATE sales_orders
       SET order_number = ?, customer_id = ?, order_date = ?,
           total_amount = ?, status = ?
       WHERE id = ?`,
      [
        String(order_number).trim(),
        Number(customer_id),
        order_date || new Date().toISOString().slice(0, 10),
        Number(total_amount),
        status || "Pending",
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query(
        "SELECT id FROM sales_orders WHERE id = ?",
        [req.params.id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Sales order not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Sales order updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Order number already exists",
      });
    }
    next(error);
  }
});

// DELETE: Delete sales order
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM sales_orders WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.json({
      success: true,
      message: "Sales order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
