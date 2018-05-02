import React from 'react'
import getLogs from '../api/get-logs'

class AuditLogs extends React.Component {
  constructor() {
    super()
    const boundMethods = [
      'renderLogs',
    ]
    boundMethods.forEach((m) => {
      this[m] = this[m].bind(this)
    })
    this.state = {}
  }

  componentWillMount() {
    const { recordIds, patientIds, userIds, startTime, endTime } = this.state
    getLogs(recordIds, patientIds, userIds, startTime, endTime)
    .then((logs) => {
      console.log(logs)
      this.setState({ logs })
    })
    .catch((errorResponse) => {
      console.log(errorResponse)
    })
  }

  renderLogs() {
    if (this.state.logs) {
      console.log(this.state.logs.length)
      return this.state.logs.map((l, i) => {
        return (
          <tr>
            <td>{l.value.actionType}</td>
            <td>{l.value.dataType}</td>
            <td>{l.value.entryMethod}</td>
            <td>{l.value.userId}</td>
            <td>{l.value.patientId}</td>
            <td>{l.value.recordId}</td>
          </tr>
        )
      })
    } else {
      return undefined
    }
  }
  render() {
    const logs = this.renderLogs()
    return (
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Data Type</th>
            <th>Entry Method</th>
            <th>User ID</th>
            <th>Patient ID</th>
            <th>Record ID</th>
          </tr>
        </thead>
        <tbody>
          {logs}
        </tbody>
      </table>
    )
  }
}

export default AuditLogs
