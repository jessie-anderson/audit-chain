import React from 'react'
import { getAllLogs } from '../api/get-logs'

class AuditLogs extends React.Component {
  constructor() {
    super()
    const boundMethods = [
      'renderLogs',
    ]
    boundMethods.forEach((m) => {
      this[m] = this[m].bind(this)
    })
    this.state = {
      logs: [],
    }
  }

  componentWillMount() {
    const { startTime, endTime } = this.state
    getAllLogs(startTime, endTime)
    .then((logs) => {
      this.setState({ logs })
    })
    .catch((errorResponse) => {
      console.log(errorResponse)
    })
  }

  renderLogs() {
    if (this.state.logs) {
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
