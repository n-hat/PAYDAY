import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Employees() {
  const [employees, setEmployees] = useState([])
  const [newName, setNewName] = useState('')
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')
  const role = localStorage.getItem('role')
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { navigate('/'); return }
    axios.get('${import.meta.env.VITE_API_URL}/employees', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEmployees(res.data))
      .catch(err => {
        if (err.response?.status === 401) {
          localStorage.clear()
          navigate('/')
        }
      })
  }, [])

  async function handleAddEmployee(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const res = await axios.post('${import.meta.env.VITE_API_URL}/employees', { name: newName }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEmployees(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName('')
  }

  async function handleDeactivate(emp) {
    if (!confirm(`Remove ${emp.name}?`)) return
    await axios.patch(`${import.meta.env.VITE_API_URL}/employees/${emp.id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEmployees(prev => prev.filter(e => e.id !== emp.id))
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1>Payday</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn-ghost" onClick={() => navigate('/summary')}>Daily Summary</button>
          <button className="btn-ghost" style={{ color: 'var(--red)' }} onClick={() => { localStorage.clear(); navigate('/') }}>Logout</button>
        </div>
      </div>
      <p className="text-muted" style={{ marginBottom: 20 }}>Welcome, {name}</p>

      {role === 'owner' && (
        <form className="row" style={{ marginBottom: 20 }} onSubmit={handleAddEmployee}>
          <input
            className="input"
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Employee name"
          />
          <button className="btn btn-primary" type="submit" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
            Add
          </button>
        </form>
      )}

      <div className="employee-list">
        {employees.map(emp => (
          <div className="employee-item" key={emp.id}>
            <span className="employee-name" onClick={() => navigate(`/pay/${emp.id}/${emp.name}`)}>
              {emp.name}
            </span>
            {role === 'owner' && (
              <button className="btn-remove" onClick={() => handleDeactivate(emp)}>Remove</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Employees
