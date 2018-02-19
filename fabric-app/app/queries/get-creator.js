import query from '../query'

export default function getCreator(req, res) {
  const request = {
    chaincodeId: 'encrypted-updates',
    fcn: 'GetCreator',
    args: [],
    transientMap: {},
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
