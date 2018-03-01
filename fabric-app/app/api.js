import query from './query'
import transaction from './transaction'

const fields = new Set(['actionType', 'userId', 'patientId', 'dataType', 'originalAuthorId', ''])

export function recordUpdate(req, res) {
  const keyArgs = Object.keys(req.body).filter((k) => {
    return k !== 'username'
  })
  const args = formatArgs(req.body, keyArgs)
  args.unshift(req.params.recordid)

  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'recordUpdate',
    args,
  }

  transaction(request, req.body.username, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send(err)
    } else {
      res.json(result)
    }
  })
}

export function historyForRecord(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'getRecordHistory',
    args: [req.params.recordid],
  }

  query(request, 'user1', (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send(err)
    } else {
      res.json(result)
    }
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
