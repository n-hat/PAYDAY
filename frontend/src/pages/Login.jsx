import { useState } from 'react'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('name', res.data.name)
      localStorage.setItem('role', res.data.role)
      window.location.href = res.data.role === 'employee' ? '/my-earnings' : '/employees'
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%' }}>
        <h1 style={{ marginBottom: 4 }}>Payday</h1>
        <p className="text-muted" style={{ marginBottom: 28 }}>Sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" type="submit">Log in</button>
        </form>
      </div>
    </div>
  )
}

export default Login
