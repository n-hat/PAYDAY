import { useEffect, useState } from 'react'
import axios from 'axios'

function Employees() {
  const [employees, setEmployees] = useState([])
  const token = localStorage.getItem('token')
  const name = localStorage.getItem('name')

  useEffect(() => {
    axios.get('http://localhost:3000/employees', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEmployees(res.data))
  }, [])

  return (
    <div>
      <h1>Welcome, {name}</h1>
      <h2>Employees</h2>
      {employees.map(emp => (
        <div key={emp.id}>
          <p>{emp.name}</p>
        </div>
      ))}
    </div>
  )
}

export default Employees
