import axios from 'axios'
import Promise from 'bluebird'

export default function login(username, password) {
  return axios.post(`${process.env.AUTH_URL}/login`, { username, password })
  .then((response) => {
    return Promise.resolve(response.data)
  })
  .catch((err) => {
    return Promise.reject(err.response)
  })
}
