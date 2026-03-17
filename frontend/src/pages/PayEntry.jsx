import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

function PayEntry() {
  const { employeeId, employeeName } = useParams()
  const [date, setDate] = useState(today())
  const [entries, setEntries] = useState([])
  const [amount, setAmount] = useState('')
  const [time, setTime] = useState('')
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(null) // { id, amount, time }
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    setEntries([])
    setAmount('')
    setTime('')
    setSaved(false)
    setEditing(null)
    axios.get(`${import.meta.env.VITE_API_URL}/pay-entries/today/${employeeId}?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEntries(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/')
        }
      })
  }, [date])

  async function handleAdd(e) {
    e.preventDefault()
    if (!amount) return
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/pay-entries`, {
      employee_id: employeeId,
      amount,
      entry_date: date,
      appointment_time: time || null
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEntries(prev => [...prev, res.data].sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || '')))
    setAmount('')
    setTime('')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  async function handleUpdate(id) {
    const res = await axios.patch(`${import.meta.env.VITE_API_URL}/pay-entries/${id}`, {
      amount: editing.amount,
      appointment_time: editing.time || null
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEntries(prev =>
      prev.map(e => e.id === id ? res.data : e)
        .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
    )
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return
    await axios.delete(`${import.meta.env.VITE_API_URL}/pay-entries/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="page">
      <button className="btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate('/employees')}>
        &larr; Back
      </button>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1>{employeeName}</h1>
          <input
            className="input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: 'auto' }}
          />
        </div>

        {entries.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {entries.map(e => (
              <div key={e.id}>
                {editing?.id === e.id ? (
                  <div className="summary-row">
                    <input
                      className="input"
                      type="time"
                      value={editing.time}
                      onChange={ev => setEditing(prev => ({ ...prev, time: ev.target.value }))}
                      style={{ width: 120, height: 36 }}
                    />
                    <input
                      className="input"
                      type="number"
                      value={editing.amount}
                      onChange={ev => setEditing(prev => ({ ...prev, amount: ev.target.value }))}
                      style={{ width: 80, height: 36 }}
                      autoFocus
                    />
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-primary"
                        style={{ height: 36, width: 'auto', padding: '0 12px', fontSize: '0.875rem' }}
                        onClick={() => handleUpdate(e.id)}
                      >Save</button>
                      <button className="btn-ghost" onClick={() => setEditing(null)}>✕</button>
                    </span>
                  </div>
                ) : (
                  <div className="summary-row">
                    <span className="summary-date">{formatTime(e.appointment_time)}</span>
                    <span className="summary-amount">${e.amount}</span>
                    {role === 'owner' && (
                      <span style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn-remove"
                          onClick={() => setEditing({ id: e.id, amount: e.amount, time: e.appointment_time || '' })}
                        >Edit</button>
                        <button className="btn-remove" onClick={() => handleDelete(e.id)}>Delete</button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="total-row" style={{ fontSize: '1rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--green)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {role === 'owner' && (
          <form onSubmit={handleAdd}>
            <div className="row" style={{ marginBottom: 8 }}>
              <input
                className="input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
              <input
                className="input"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <button className="btn btn-primary" type="submit">
              {saved ? 'Saved!' : 'Add'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default PayEntry
