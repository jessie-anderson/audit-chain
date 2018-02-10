import query from '../query'

export default function getLogById(req, res) {
  const request = {
    chaincodeId: 'updates-in-state',
    fcn: 'getLogById',
    args: [
      req.params.logid,
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
