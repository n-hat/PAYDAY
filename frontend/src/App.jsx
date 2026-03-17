import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Employees from './pages/Employees.jsx'
import PayEntry from './pages/PayEntry.jsx'
import WeeklySummary from './pages/WeeklySummary.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/pay/:employeeId/:employeeName" element={<PayEntry />} />
      <Route path="/summary" element={<WeeklySummary />} />
    </Routes>
  )
}

export default App
