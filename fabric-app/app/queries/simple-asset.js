import transaction from '../transaction'
import query from '../query'

export function createAsset(req, res) {
  const request = {
    chaincodeId: 'simple-cc-1',
    fcn: 'putState',
    args: [
      req.body.key,
      req.body.value,
    ],
  }
  transaction(request, (error, response) => {
    if (error) {
      console.log(error)
      res.json(error)
    } else {
      res.json(response)
    }
  })
}

export function getAsset(req, res) {
  console.log('getting asset')
  const request = {
    chaincodeId: 'simple-cc-1',
    fcn: 'getState',
    args: [
      req.params.key,
    ],
  }

  query(request, (error, response) => {
    if (error) {
      console.log(error)
      res.json(error)
    } else {
      res.json(response)
    }
  })
}
