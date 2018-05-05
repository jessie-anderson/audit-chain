import React from 'react'
import { getAllLogs } from '../api/get-logs'

class AuditLogs extends React.Component {
  constructor() {
    super()
    const boundMethods = [
      'renderLogs',
      'filterQuery',
      'onStartTimeChanged',
      'onEndTimeChanged',
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

  onStartTimeChanged(ev) {
    this.setState({
      startTime: Date.parse(ev.target.value),
    })
  }

  onEndTimeChanged(ev) {
    this.setState({
      endTime: Date.parse(ev.target.value),
    })
  }

  filterQuery() {
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
            <td>{l.actionType}</td>
            <td>{l.dataType}</td>
            <td>{l.entryMethod}</td>
            <td>{l.userId}</td>
            <td>{l.patientId}</td>
            <td>{l.recordId}</td>
            <td>{new Date(l.time).toString()}</td>
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
      <div>
        <label htmlFor="start-time">between</label>
        <input type="datetime-local" id="start-time" onChange={this.onStartTimeChanged} />
        <label htmlFor="end-time">and</label>
        <input type="datetime-local" id="end-time" onChange={this.onEndTimeChanged} />
        <button onClick={this.filterQuery}>Filter</button>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Data Type</th>
              <th>Entry Method</th>
              <th>User ID</th>
              <th>Patient ID</th>
              <th>Record ID</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs}
          </tbody>
        </table>
      </div>
    )
  }
}

export default AuditLogs
