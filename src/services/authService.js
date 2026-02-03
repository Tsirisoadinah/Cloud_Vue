import api from './api'

export const login = async (email, password) => {
  const res = await api.post('/auth/login', {
    email,
    password
  })

  return res.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('expiresAt')
  localStorage.removeItem('role')
}


export const signup = (data) => {
  return api.post('/auth/register', data)
}


export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export const isAdmin = () => {
  const role = localStorage.getItem('role')
  return role === 'manager' || role === 'admin'
}
