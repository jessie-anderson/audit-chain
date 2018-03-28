import axios from 'axios'
import Promise from 'bluebird'

export default function enroll(newUsername, newPassword) {
  const token = localStorage.getItem('token')
  const fabricEnrollmentId = JSON.parse(localStorage.getItem('user')).username
  return axios.post(`${process.env.API_URL}/enroll`, {
    username: newUsername,
    fabricEnrollmentId,
    password: newPassword,
  }, {
    headers: {
      authorization: `bearer ${token}`,
    },
  })
  .then((response) => {
    return Promise.resolve(response.data)
  })
  .catch((err) => {
    return Promise.reject(err.response)
  })
}
