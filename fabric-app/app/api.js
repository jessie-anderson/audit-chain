import query from './query'
import transaction from './transaction'

export function recordUpdate(req, res) {
  const args = formatArgs(req.body)
  args.unshift(req.params.recordid)

  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'recordUpdate',
    args,
  }

  transaction(request, (err, result) => {
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

  query(request, (err, result) => {
    if (err) {
      console.error(err)
      res.status(500).send(err)
    } else {
      res.json(result)
    }
  })
}

function formatArgs(object) {
  if (typeof object !== 'object') {
    return new Error('Argument is not an object')
  }

  return Object.keys(object).filter((k) => {
    return k !== 'recordId'
  }).map((k) => {
    return `${k}:${object[k]}`
  })
}
