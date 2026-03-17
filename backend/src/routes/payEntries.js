// Pay entry routes — handles logging, editing, and viewing daily employee pay.

const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

// Add a pay entry for an employee
router.post('/', requireAuth, requireRole('owner'), async (req, res) => {
  const { employee_id, amount, entry_date, appointment_time } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO pay_entries (employee_id, amount, entry_date, appointment_time, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employee_id, amount, entry_date || new Date().toISOString().split('T')[0], appointment_time || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get entries for the logged-in employee on a given date
router.get('/mine', requireAuth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const employeeId = req.user.employee_id;
  if (!employeeId) return res.status(403).json({ error: 'Not linked to an employee record' });
  try {
    const result = await pool.query(
      'SELECT * FROM pay_entries WHERE employee_id = $1 AND entry_date = $2 ORDER BY appointment_time',
      [employeeId, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a given day (pass ?date=2026-03-10)
router.get('/day', requireAuth, async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT e.name, p.id, p.employee_id, p.entry_date, p.amount, p.appointment_time
       FROM pay_entries p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.entry_date = $1
         AND e.is_active = true
       ORDER BY e.name, p.appointment_time`,
      [date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all entries for a specific employee on a given date (defaults to today)
router.get('/today/:employeeId', requireAuth, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      'SELECT * FROM pay_entries WHERE employee_id = $1 AND entry_date = $2 ORDER BY appointment_time',
      [req.params.employeeId, date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a pay entry's amount and/or appointment_time
router.patch('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  const { amount, appointment_time } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pay_entries SET amount = $1, appointment_time = $2 WHERE id = $3 RETURNING *',
      [amount, appointment_time || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a pay entry
router.delete('/:id', requireAuth, requireRole('owner'), async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pay_entries WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
