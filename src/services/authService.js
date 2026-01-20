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
  localStorage.removeItem('role') // si tu stockes aussi les infos user
}


export const signup = (data) => {
  return api.post('/auth/register', data)
}


export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}
