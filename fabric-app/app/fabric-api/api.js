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
])

export function recordUpdate(req, res) {
  console.log(req.user)
  const keyArgs = Object.keys(req.body).filter((k) => {
    return fields.has(k)
  })
  const args = formatArgs(req.body, keyArgs)
  args.unshift(
    `recordId:${req.params.recordid}`,
    `patientId:${req.params.patientid}`,
    `userId:${req.params.userid}`,
  )
  console.log(args)

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
    fcn: 'getRecordHistory',
    args: [req.params.start, req.params.end, req.params.recordId],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
}

export function historyForPatient(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForPatientForTimeRange',
    args: [req.params.start, req.params.end, req.params.patientId],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
}

export function historyForUser(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForUserForTimeRange',
    args: [req.params.start, req.params.end, req.params.userId],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
}

export function allHistory(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getAllLogsForTimeRange',
    args: [req.params.start, req.params.end],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
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
