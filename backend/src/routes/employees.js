// Routes define what happens when a request hits a specific URL.
// Each route has a method (GET, POST, PATCH, DELETE), a path (/employees),
// and a handler function that queries the database and sends back a response.

const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAuth = require('../middleware/auth');

// Get all active employees
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new employee
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO employees (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deactivate an employee
router.patch('/:id/deactivate', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE employees SET is_active = false WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;