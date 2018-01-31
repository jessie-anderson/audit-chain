import query from '../query'

export default function createLog(req, res) {
  const params = req.body
  const request = {
    chaincodeId: 'audit-chaincode',
    fcn: 'createLog',
    args: [
      params.actionType,
      params.time,
      params.userId,
      params.patientId,
      params.dataType,
      params.originalAuthorId,
      params.dataField,
      params.data,
      params.entryMethod,
      params.userNpi,
      params.originalAuthorNpi,
      params.organizationNpi,
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
