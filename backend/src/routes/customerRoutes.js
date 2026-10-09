import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET: View all customers
router.get("/", async (req, res, next) => {
  try {
    const [customers] = await pool.query(
      "SELECT * FROM customers ORDER BY id DESC",
    );

    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
});

// POST: Add a customer
router.post("/", async (req, res, next) => {
  try {
    const { customer_name, company_name, phone, email, address } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO customers
       (customer_name, company_name, phone, email, address)
       VALUES (?, ?, ?, ?, ?)`,
      [
        customer_name.trim(),
        company_name || null,
        phone || null,
        email || null,
        address || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Update a customer
router.put("/:id", async (req, res, next) => {
  try {
    const { customer_name, company_name, phone, email, address } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const [result] = await pool.query(
      `UPDATE customers
       SET customer_name = ?, company_name = ?, phone = ?, email = ?, address = ?
       WHERE id = ?`,
      [
        customer_name.trim(),
        company_name || null,
        phone || null,
        email || null,
        address || null,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({ success: true, message: "Customer updated successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete a customer
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM customers WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
