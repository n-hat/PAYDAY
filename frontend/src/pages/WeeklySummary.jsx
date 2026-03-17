import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function WeeklySummary() {
  const [entries, setEntries] = useState([])
  const [week, setWeek] = useState(getMonday(new Date()))
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    axios.get(`http://localhost:3000/pay-entries/week?week=${week}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEntries(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/')
        }
      })
  }, [week])

  const total = entries.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div>
      <button onClick={() => navigate('/employees')}>Back</button>
      <h1>Weekly Summary</h1>
      <input
        type="date"
        value={week}
        onChange={e => setWeek(e.target.value)}
      />
      {entries.length === 0 ? (
        <p>No entries for this week.</p>
      ) : (
        <>
          {entries.map((e, i) => (
            <div key={i}>
              <span>{e.name}</span>
              <span>{e.entry_date.slice(0, 10)}</span>
              <span>${e.amount}</span>
            </div>
          ))}
          <p>Total: ${total.toFixed(2)}</p>
        </>
      )}
    </div>
  )
}

export default WeeklySummary
