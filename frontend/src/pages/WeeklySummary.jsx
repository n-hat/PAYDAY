import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function formatTime(t) {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function WeeklySummary() {
  const [entries, setEntries] = useState([])
  const [date, setDate] = useState(today())
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    axios.get(`${import.meta.env.VITE_API_URL}/pay-entries/day?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEntries(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/')
        }
      })
  }, [date])

  // Group entries by employee name
  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.name]) acc[e.name] = []
    acc[e.name].push(e)
    return acc
  }, {})

  const grandTotal = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="page">
      <button className="btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate('/employees')}>
        &larr; Back
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Daily Summary</h1>
        <input
          className="input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>

      {entries.length === 0 ? (
        <div className="card">
          <p className="text-muted" style={{ textAlign: 'center', padding: '16px 0' }}>No entries for this day.</p>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([name, empEntries]) => {
            const subtotal = empEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
            return (
              <div className="card" key={name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ margin: 0 }}>{name}</h2>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>${subtotal.toFixed(2)}</span>
                </div>
                {empEntries.map((e, i) => (
                  <div className="summary-row" key={i}>
                    <span className="summary-date">{formatTime(e.appointment_time)}</span>
                    <span className="summary-amount">${e.amount}</span>
                  </div>
                ))}
              </div>
            )
          })}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Grand Total</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green)' }}>${grandTotal.toFixed(2)}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default WeeklySummary
