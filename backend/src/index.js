require('dotenv').config();
const express = require('express');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const payEntriesRoutes = require('./routes/payEntries');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/pay-entries', payEntriesRoutes);

app.get('/', async (req, res) => {
    try{
        const result = await pool.query('SELECT NOW()');
        res.send(`PAYDAY API is running. DB time: ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send('Database connection failed: ' + err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});