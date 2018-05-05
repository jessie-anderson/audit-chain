import axios from 'axios'
import Promise from 'bluebird'

const peerName = 'peer0'

export function getLogs(recordIds, patientIds, userIds, startTime, endTime) {
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

export function getAllLogs(startTime, endTime) {
  const query = { startTime, endTime }
  console.log(query)
  const route = `${process.env.API_URL}/logs/all/${peerName}`
  return handleGetWithQuery(route, query)
}

export function getLogsForPatient(startTime, endTime, patientId) {
  const query = { startTime, endTime, patientId }
  const route = `${process.env.API_URL}/logs/patient/${peerName}`
  return handleGetWithQuery(route, query)
}

export function getLogsForUser(startTime, endTime, userId) {
  const query = { startTime, endTime, userId }
  const route = `${process.env.API_URL}/logs/user/${peerName}`
  return handleGetWithQuery(route, query)
}

export function getLogsForRecord(startTime, endTime, recordId) {
  const query = { startTime, endTime, recordId }
  const route = `${process.env.API_URL}/logs/record/${peerName}`
  return handleGetWithQuery(route, query)
}

export function getLogsForQuery(startTime, endTime, recordIds, userIds, patientIds) {
  const query = { startTime, endTime, recordIds, userIds, patientIds }
  const route = `${process.env.API_URL}/logs/query/${peerName}`
  return handleGetWithQuery(route, query)
}

function handleGetWithQuery(route, params) {
  const headers = {
    authorization: `bearer ${localStorage.getItem('token')}`,
  }
  return axios.get(route, { params, headers })
  .then((response) => {
    return Promise.resolve(response.data)
  })
  .catch((err) => {
    return Promise.reject(err.response)
  })
}
