import _ from 'lodash'
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
  console.log(args)

  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'recordUpdate',
    args,
  }

  transaction(request, req.user.username, (err, result) => {
    handleResult(err, result, res)
  })
}

export function historyForRecord(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getRecordHistory',
    args: [req.params.recordid],
  }

  query(request, req.user.username, (err, result) => {
    handleResult(err, result, res)
  })
}

export function getQueryCreator(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getCreator',
    args: [],
  }

  query(request, req.user.username, (err, result) => {
    handleResult(err, result, res)
  })
}

/*
* Filter logs by any combination of the following:
* userId
* patientId
* time range
*/
export function filterQuery(req, res) {
  const patientIds = req.query.patientIds
  const userIds = req.query.userIds
  const startTime = req.query.startTime
  const endTime = req.query.endTime
  console.log(req.query)
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getLogQueryResult',
    args: [
      patientIds || '',
      userIds || '',
      startTime || '',
      endTime || '',
    ],
  }

  query(request, req.user.username, (err, result) => {
    let results
    if (result) {
      results = JSON.parse(result)
      // sort by time
      results = _.sortBy(results, (r) => {
        return r.time.seconds + (r.time.nanoseconds / parseFloat(1000000000))
      })
      results.forEach((r) => {
        r.time = (new Date((r.time.seconds * 1000) + (r.time.nanoseconds / 1000000))).toString()
      })
    }
    handleResult(err, results, res)
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
