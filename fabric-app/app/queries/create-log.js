import transaction from '../transaction'

export default function createLog(req, res) {
  // const params = req.body
  // const log = {
  //   actionType: params.actionType,
  //   time: params.time,
  //   userId: params.userId,
  //   patientId: params.patientId,
  //   dataType: params.dataType,
  //   originalAuthorId: params.originalAuthorId,
  //   dataField: params.dataField,
  //   data: params.data,
  //   entryMethod: params.entryMethod,
  //   userNpi: params.userNpi,
  //   originalAuthorNpi: params.originalAuthorNpi,
  //   organizationNpi: params.organizationNpi,
  // }
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'EncryptAndPut',
    args: [
    ],
    transientMap: {
    },
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
