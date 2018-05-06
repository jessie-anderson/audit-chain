import React from 'react'
import { Button } from 'react-bootstrap'
import { getAllLogs } from '../api/get-logs'

class AuditLogs extends React.Component {
  constructor() {
    super()
    const boundMethods = [
      'renderLogs',
      'filterQuery',
      'onStartTimeChanged',
      'onEndTimeChanged',
      'onAddUser',
      'onAddRecordId',
      'onAddPatient',
      'onCurrentUserIdChange',
      'onCurrentRecordIdChange',
      'onCurrentPatientIdChange',
      'onRecordIdKeyUp',
      'onPatientKeyUp',
      'onUserKeyUp',
      'removeRecordId',
      'removePatientId',
      'removeUserId',
    ]
    boundMethods.forEach((m) => {
      this[m] = this[m].bind(this)
    })
    this.state = {
      logs: [],
      userIds: [],
      patientIds: [],
      recordIds: [],
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

  onAddUser() {
    if (this.state.currentUserId) {
      this.state.userIds.push(this.state.currentUserId)
      document.getElementById('user-id-input').value = null
      this.setState({ currentUserId: null })
    }
  }

  onAddRecordId() {
    if (this.state.currentRecordId) {
      this.state.recordIds.push(this.state.currentRecordId)
      document.getElementById('record-id-input').value = null
      this.setState({ currentRecordId: null })
    }
  }

  onAddPatient() {
    if (this.state.currentPatientId) {
      this.state.patientIds.push(this.state.currentPatientId)
      document.getElementById('patient-id-input').value = null
      this.setState({ currentPatientId: null })
    }
  }

  onCurrentRecordIdChange(ev) {
    this.setState({ currentRecordId: ev.target.value })
  }

  onCurrentUserIdChange(ev) {
    this.setState({ currentUserId: ev.target.value })
  }

  onCurrentPatientIdChange(ev) {
    this.setState({ currentPatientId: ev.target.value })
  }

  onRecordIdKeyUp(ev) {
    if (ev.keyCode === 13) {
      this.onAddRecordId()
    }
  }

  onUserKeyUp(ev) {
    if (ev.keyCode === 13) {
      this.onAddUser()
    }
  }

  onPatientKeyUp(ev) {
    if (ev.keyCode === 13) {
      this.onAddPatient()
    }
  }

  removeUserId(index) {
    this.state.userIds.splice(index, 1)
    this.setState({
      userIds: this.state.userIds,
    })
  }

  removeRecordId(index) {
    this.state.recordIds.splice(index, 1)
    this.setState({
      recordIds: this.state.recordIds,
    })
  }

  removePatientId(index) {
    this.state.patientIds.splice(index, 1)
    this.setState({
      patientIds: this.state.patientIds,
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

  renderUserIds() {
    return this.state.userIds.map((id, i) => {
      return (
        <div>
          {id}
          <Button onClick={() => { this.removeUserId(i) }}>
            Remove
          </Button>
        </div>
      )
    })
  }

  renderRecordIds() {
    return this.state.recordIds.map((id, i) => {
      return (
        <div>
          {id}
          <Button onClick={() => { this.removeRecordId(i) }}>
            Remove
          </Button>
        </div>
      )
    })
  }

  renderPatientIds() {
    return this.state.patientIds.map((id, i) => {
      return (
        <div>
          {id}
          <Button onClick={() => { this.removePatientId(i) }}>
            Remove
          </Button>
        </div>
      )
    })
  }

  render() {
    const logs = this.renderLogs()
    return (
      <div>
        <label htmlFor="start-time">between</label>
        <input
          type="datetime-local"
          id="start-time"
          onChange={this.onStartTimeChanged}
        />
        <label htmlFor="end-time">and</label>
        <input
          type="datetime-local"
          id="end-time"
          onChange={this.onEndTimeChanged}
        />
        <div>Include records from:</div>
        <div>
          <div>Record IDs</div>
          {this.renderRecordIds()}
          <input
            type="text"
            onChange={this.onCurrentRecordIdChange}
            onKeyUp={this.onRecordIdKeyUp}
            id="record-id-input"
          />
          <Button onClick={this.onAddRecordId}>
            Add
          </Button>
          <div>Users (enter IDs)</div>
          {this.renderUserIds()}
          <input
            type="text"
            onChange={this.onCurrentUserIdChange}
            onKeyUp={this.onUserKeyUp}
            id="user-id-input"
          />
          <Button onClick={this.onAddUser}>
            Add
          </Button>
          <div>Patients (enter IDs)</div>
          {this.renderPatientIds()}
          <input
            type="text"
            onChange={this.onCurrentPatientIdChange}
            onKeyUp={this.onPatientKeyUp}
            id="patient-id-input"
          />
          <Button onClick={this.onAddPatient}>
            Add
          </Button>
        </div>
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
