import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Employees from './pages/Employees.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/employees" element={<Employees />} />
    </Routes>
  )
}

export default App
