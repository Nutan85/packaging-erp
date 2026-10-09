import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

// GET: View all suppliers
router.get("/", async (req, res, next) => {
  try {
    const [suppliers] = await pool.query(
      "SELECT * FROM suppliers ORDER BY id DESC",
    );

    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
});

// POST: Add supplier
router.post("/", async (req, res, next) => {
  try {
    const { supplier_name, company_name, phone, email, address } = req.body;

    if (!supplier_name || !String(supplier_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO suppliers
       (supplier_name, company_name, phone, email, address)
       VALUES (?, ?, ?, ?, ?)`,
      [
        String(supplier_name).trim(),
        company_name || null,
        phone || null,
        email || null,
        address || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Update supplier
router.put("/:id", async (req, res, next) => {
  try {
    const { supplier_name, company_name, phone, email, address } = req.body;

    if (!supplier_name || !String(supplier_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    const [result] = await pool.query(
      `UPDATE suppliers
       SET supplier_name = ?, company_name = ?, phone = ?,
           email = ?, address = ?
       WHERE id = ?`,
      [
        String(supplier_name).trim(),
        company_name || null,
        phone || null,
        email || null,
        address || null,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.query("SELECT id FROM suppliers WHERE id = ?", [
        req.params.id,
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Delete supplier
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM suppliers WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message:
          "This supplier is linked to a purchase order and cannot be deleted",
      });
    }
    next(error);
  }
});

export default router;
