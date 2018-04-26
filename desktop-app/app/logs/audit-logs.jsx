import React from 'react'
import getLogs from '../api/get-logs'
import LogEntry from './log-entry'

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
      return this.state.logs.map((l, i) => {
        return <LogEntry log={l} /> // add key - record ID
      })
    } else {
      return undefined
    }
  }
  render() {
    const logs = this.renderLogs()
    return <div>{logs}</div>
  }
}

export default AuditLogs
