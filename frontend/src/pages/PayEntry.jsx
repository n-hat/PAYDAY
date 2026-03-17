import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

function PayEntry() {
  const { employeeId, employeeName } = useParams()
  const [amount, setAmount] = useState('')
  const [existingEntry, setExistingEntry] = useState(null)
  const [saved, setSaved] = useState(false)
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    axios.get(`http://localhost:3000/pay-entries/today/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data) {
        setExistingEntry(res.data)
        setAmount(res.data.amount)
      }
    }).catch(err => {
      if (err.response?.status === 401) {
        localStorage.clear()
        navigate('/')
      }
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await axios.post('http://localhost:3000/pay-entries', {
      employee_id: employeeId,
      amount
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setSaved(true)
    setTimeout(() => navigate('/employees'), 1500)
  }

  async function handleDelete() {
    if (!confirm('Delete this entry?')) return
    await axios.delete(`http://localhost:3000/pay-entries/${existingEntry.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    navigate('/employees')
  }

  return (
    <div>
      <button onClick={() => navigate('/employees')}>Back</button>
      <h1>{employeeName}</h1>
      <p>Today's Pay</p>
      {saved ? (
        <p>Saved!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
          />
          <button type="submit">{existingEntry ? 'Update' : 'Save'}</button>
          {existingEntry && role === 'owner' && (
            <button type="button" onClick={handleDelete}>Delete</button>
          )}
        </form>
      )}
    </div>
  )
}

export default PayEntry
