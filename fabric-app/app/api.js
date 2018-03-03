import query from './query'
import transaction from './transaction'

const fields = new Set([
  'actionType',
  'userId',
  'patientId',
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
  const keyArgs = Object.keys(req.body).filter((k) => {
    return fields.has(k)
  })
  const args = formatArgs(req.body, keyArgs)
  args.unshift(req.params.recordid)

  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'recordUpdate',
    args,
  }

  transaction(request, req.user.username, handleResult)
}

export function historyForRecord(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getRecordHistory',
    args: [req.params.recordid],
  }

  query(request, req.user.username, handleResult)
}

export function getQueryCreator(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getCreator',
    args: [],
  }

  query(request, req.user.username, handleResult)
}

/*
* Filter logs by any combination of the following:
* userId
* patientId
* time range
*/
export function filterQuery(req, res) {
  const patientIds = req.params.patientIds
  const userIds = req.params.patientIds
  const startTime = req.params.startTime
  const endTime = req.params.endTime
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getLogQueryResult',
    args: [patientIds, userIds, startTime, endTime],
  }

  query(request, req.user.username, handleResult)
}

function formatArgs(object, keyArgs) {
  if (typeof object !== 'object') {
    return new Error('Argument is not an object')
  }

  return keyArgs.map((k) => {
    return `${k}:${object[k]}`
  })
}

function handleResult(err, res) {
  if (err) {
    console.error(err)
    res.status(500).send(err)
  } else {
    res.json(res)
  }
}
