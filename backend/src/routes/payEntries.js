// Pay entry routes — handles logging, editing, and viewing daily employee pay.

const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/auth');

// Log pay for an employee (or update if entry already exists for that day)
router.post('/', requireAuth, async (req, res) => {
  const { employee_id, amount, entry_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pay_entries (employee_id, amount, entry_date, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (employee_id, entry_date)
       DO UPDATE SET amount = $2, updated_at = NOW()
       RETURNING *`,
      [employee_id, amount, entry_date || new Date().toISOString().split('T')[0], req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a given week (pass ?week=2026-03-10 for the Monday of that week)
router.get('/week', requireAuth, async (req, res) => {
  const { week } = req.query;
  try {
    const result = await pool.query(
      `SELECT e.name, p.entry_date, p.amount
       FROM pay_entries p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.entry_date >= $1 AND p.entry_date < ($1::date + interval '7 days')
       ORDER BY e.name, p.entry_date`,
      [week]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;