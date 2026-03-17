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
    axios.get('http://localhost:3000/employees', {
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
    const res = await axios.post('http://localhost:3000/employees', { name: newName }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEmployees(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName('')
  }

  async function handleDeactivate(emp) {
    if (!confirm(`Remove ${emp.name}?`)) return
    await axios.patch(`http://localhost:3000/employees/${emp.id}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setEmployees(prev => prev.filter(e => e.id !== emp.id))
  }

  return (
    <div>
      <h1>Welcome, {name}</h1>
      <h2>Employees</h2>
      <button onClick={() => navigate('/summary')}>Weekly Summary</button>
      {role === 'owner' && (
        <form onSubmit={handleAddEmployee}>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Employee name"
          />
          <button type="submit">Add Employee</button>
        </form>
      )}
      {employees.map(emp => (
        <div key={emp.id}>
          <span onClick={() => navigate(`/pay/${emp.id}/${emp.name}`)}>{emp.name}</span>
          {role === 'owner' && (
            <button onClick={() => handleDeactivate(emp)}>Remove</button>
          )}
        </div>
      ))}
    </div>
  )
}

export default Employees
