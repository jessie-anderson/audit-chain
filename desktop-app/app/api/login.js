import axios from 'axios'

export default function login(username, password) {
  return axios.post(`${process.env.AUTH_URL}/login`, { username, password })
  .then((response) => {
    localStorage.setItem('token', response.data.token)
  })
  .catch((err) => { console.log(err) })
}
