import query from '../query'

export default function getAllLogs(req, res) {
  const request = {
    chaincodeId: 'audit-chaincode',
    fcn: 'getAllLogs',
    args: [],
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
