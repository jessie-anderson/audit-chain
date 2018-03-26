import axios from 'axios'
import Promise from 'bluebird'

export default function registerUser({ fname, lname, npi, userId, role }) {
  // need to set bearer token
  return axios.post(`${process.env.ADMIN_URL}/registeruser`, {
    username: userId,
    npi,
    firstName: fname,
    lastName: lname,
    role,
  }, {
    headers: {
      authorization: `bearer ${localStorage.getItem('token')}`,
    },
  })
  .then((response) => {
    return Promise.resolve(response.data)
  })
  .catch((err) => {
    return Promise.reject(err.response)
  })
}
