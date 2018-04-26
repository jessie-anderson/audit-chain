import axios from 'axios'
import Promise from 'bluebird'

export default function getLogs(recordIds, patientIds, userIds, startTime, endTime) {
  const params = {
    recordIds: recordIds ? recordIds.join() : null,
    patientIds: patientIds ? patientIds.join() : null,
    userIds: userIds ? userIds.join() : null,
  }

  const headers = {
    authorization: `bearer ${localStorage.getItem('token')}`,
  }

  return axios.get(`${process.env.API_URL}/logs/peer0`, { params, headers })
  .then((response) => {
    return Promise.resolve(response.data)
  })
  .catch((err) => {
    return Promise.reject(err.response)
  })
}
