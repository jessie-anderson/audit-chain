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
    args: [req.params.recordid],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
    handleResult(err, result, res)
  })
}

export function getQueryCreator(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getCreator',
    args: [],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
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
  const recordIds = req.query.recordIds ? formatIds(req.query.recordIds.split(',')) : req.query.recordIds
  const patientIds = req.query.patientIds ? formatIds(req.query.patientIds.split(',')) : req.query.patientIds
  const userIds = req.query.userIds ? formatIds(req.query.userIds.split(',')) : req.query.userIds
  console.log(recordIds, patientIds, userIds)
  const startTime = req.query.startTime
  const endTime = req.query.endTime
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getLogQueryResult',
    args: [
      recordIds || '',
      patientIds || '',
      userIds || '',
      startTime || '',
      endTime || '',
    ],
  }

  query(request, req.user.fabricEnrollmentId, req.params.peerName, (err, result) => {
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

function formatIds(args, prepend) {
  return args.map((a) => {
    return `${prepend}:${a}`
  }).join(',')
}

function handleResult(err, result, res) {
  if (err) {
    console.error(err)
    res.status(500).send(err)
  } else {
    res.json(result)
  }
}
