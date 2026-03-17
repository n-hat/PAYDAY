import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatTime(t) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function MyEarnings() {
  const [entries, setEntries] = useState([])
  const [date, setDate] = useState(today())
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    axios.get(`${import.meta.env.VITE_API_URL}/pay-entries/mine?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEntries(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/')
        }
      })
  }, [date])

  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1>Payday</h1>
        <button className="btn-ghost" style={{ color: 'var(--red)' }} onClick={() => { localStorage.clear(); navigate('/') }}>Logout</button>
      </div>
      <p className="text-muted" style={{ marginBottom: 24 }}>Welcome, {name}</p>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>My Earnings</h2>
          <input
            className="input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        {entries.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>No entries for this day.</p>
        ) : (
          <>
            {entries.map(e => (
              <div className="summary-row" key={e.id}>
                <span className="summary-date">{formatTime(e.appointment_time)}</span>
                <span className="summary-amount">${parseFloat(e.amount).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--green)' }}>${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyEarnings