import api from './api'

const userService = {
  getMe: async () => {
    const res = await api.get('/api/users/me')
    return res.data
  },

  getUsers: async () => {
    const res = await api.get('/api/users')
    return res.data
  },

  deleteUser: async (id) => {
    await api.delete(`/api/users/${id}`)
  },
}

export default userService
export const { getMe, getUsers, deleteUser } = userService
