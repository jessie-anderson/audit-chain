import _ from 'lodash'

import query from './query'
import transaction from './transaction'

const fields = new Set([
  'actionType',
  'dataType',
  'originalAuthorId',
  'dataField',
  'data',
  'entryMethod',
  'userNpi',
  'originalAuthorNpi',
  'organizationNpi',
  'time',
])

export function recordUpdate(req, res) {
  const keyArgs = Object.keys(req.body).filter((k) => {
    return fields.has(k)
  })
  const args = formatArgs(req.body, keyArgs)
  args.unshift(
    `recordId:${req.params.recordid}`,
    `patientId:${req.params.patientid}`,
    `userId:${req.params.userid}`,
  )

  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'recordUpdate',
    args,
  }

  transaction(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
}

export function historyForRecord(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForRecordForTimeRange',
    args: [
      req.query.startTime || '',
      req.query.endTime || '',
      req.query.recordId,
    ],
  }

  doQuery(request, req.user.fabricEnrollmentId, req.params.peerName, res)
}

export function historyForPatient(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForPatientForTimeRange',
    args: [
      req.query.startTime || '',
      req.query.endTime || '',
      req.query.patientId,
    ],
  }

  doQuery(request, req.user.fabricEnrollmentId, req.params.peerName, res)
}

export function historyForUser(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForUserForTimeRange',
    args: [req.query.startTime || '', req.query.endTime || '', req.query.userId],
  }

  doQuery(request, req.user.fabricEnrollmentId, req.params.peerName, res)
}

export function allHistory(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForTimeRange',
    args: [req.query.startTime || '', req.query.endTime || ''],
  }

  doQuery(request, req.user.fabricEnrollmentId, req.params.peerName, res)
}

export function historyForQuery(req, res) {
  console.log(req.query)
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForQueryForTimeRange',
    args: [
      req.query.startTime || '',
      req.query.endTime || '',
      req.query.recordIds ? req.query.recordIds.join(',') : '',
      req.query.userIds ? req.query.userIds.join(',') : '',
      req.query.patientIds ? req.query.patientIds.join(',') : '',
    ],
  }
  console.log(request)

  doQuery(request, req.user.fabricEnrollmentId, req.params.peerName, res)
}

function formatArgs(object, keyArgs) {
  if (typeof object !== 'object') {
    return new Error('Argument is not an object')
  }

  return keyArgs.map((k) => {
    return `${k}:${object[k]}`
  })
}

function handleResult(err, result, res) {
  if (err) {
    console.error(err)
    res.status(500).send(err)
  } else {
    res.json(result)
  }
}

function doQuery(request, fabricEnrollmentId, peerName, res) {
  query(request, fabricEnrollmentId, peerName, (err, result) => {
    let results
    if (result) {
      results = JSON.parse(result)
      // sort by time
      results = _.sortBy(results, (r) => { return r.time })
    }
    handleResult(err, results, res)
  })
}
