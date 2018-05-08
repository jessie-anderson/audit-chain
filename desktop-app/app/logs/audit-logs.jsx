import React from 'react'
import { Button, Grid, Row, Col, FormControl, Table } from 'react-bootstrap'
import {
  getAllLogs,
  getLogsForRecord,
  getLogsForUser,
  getLogsForPatient,
  getLogsForQuery,
} from '../api/get-logs'

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
    const { startTime, endTime, recordIds, patientIds, userIds } = this.state
    let promise
    if (
      recordIds.length === 0
      && patientIds.length === 0
      && userIds.length === 0
    ) {
      promise = getAllLogs(startTime, endTime)
    } else if (
      recordIds.length === 1
      && patientIds.length === 0
      && userIds.length === 0
    ) {
      promise = getLogsForRecord(startTime, endTime, recordIds[0])
    } else if (
      recordIds.length === 0
      && patientIds.length === 1
      && userIds.length === 0
    ) {
      promise = getLogsForPatient(startTime, endTime, patientIds[0])
    } else if (
      recordIds.length === 0
      && patientIds.length === 0
      && userIds.length === 1
    ) {
      promise = getLogsForUser(startTime, endTime, userIds[0])
    } else {
      promise = getLogsForQuery(startTime, endTime, recordIds, userIds, patientIds)
    }
    promise
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
        <Row bsClass="row padded-row">
          <Col md={6} sm={12} xs={12}>
            <span>{id}</span>
          </Col>
          <Col md={6} sm={12} xs={12}>
            <Button onClick={() => { this.removeUserId(i) }}>
              Remove
            </Button>
          </Col>
        </Row>
      )
    })
  }

  renderRecordIds() {
    return this.state.recordIds.map((id, i) => {
      return (
        <Row bsClass="row padded-row">
          <Col md={6} sm={12} xs={12}>
            <span>{id}</span>
          </Col>
          <Col md={6} sm={12} xs={12}>
            <Button onClick={() => { this.removeRecordId(i) }}>
              Remove
            </Button>
          </Col>
        </Row>
      )
    })
  }

  renderPatientIds() {
    return this.state.patientIds.map((id, i) => {
      return (
        <Row bsClass="row padded-row">
          <Col md={6} sm={12} xs={12}>
            <span>{id}</span>
          </Col>
          <Col md={6} sm={12} xs={12}>
            <Button onClick={() => { this.removePatientId(i) }}>
              Remove
            </Button>
          </Col>
        </Row>
      )
    })
  }

  render() {
    const logs = this.renderLogs()
    return (
      <Grid>
        <Row bsClass="row padded-row">
          <Col md={12} s={12} xs={12}>
            <b style={{ fontSize: '20px' }}>Filtering Criteria</b>
          </Col>
        </Row>
        <Row bsClass="row padded-row">
          <Col md={6} s={12} xs={12}>
            <label htmlFor="start-time">Start Time</label>
            <FormControl
              type="datetime-local"
              id="start-time"
              onChange={this.onStartTimeChanged}
            />
          </Col>
          <Col md={6} s={12} xs={12}>
            <label htmlFor="end-time">End Time</label>
            <FormControl
              type="datetime-local"
              id="end-time"
              onChange={this.onEndTimeChanged}
            />
          </Col>
        </Row>
        <Row bsClass="row padded-row">
          <Col md={12} s={12} xs={12}>
            <span>Patient IDs</span>
          </Col>
        </Row>
        {this.renderPatientIds()}
        <Row bsClass="row padded-row">
          <Col md={6} s={12} xs={12}>
            <FormControl
              type="text"
              onChange={this.onCurrentPatientIdChange}
              onKeyUp={this.onPatientKeyUp}
              id="patient-id-input"
            />
          </Col>
          <Col md={6} s={12} xs={12}>
            <Button onClick={this.onAddPatient}>
              Add
            </Button>
          </Col>
        </Row>
        <Row bsClass="row padded-row">
          <Col md={12} s={12} xs={12}>
            <span>User IDs</span>
          </Col>
        </Row>
        {this.renderUserIds()}
        <Row bsClass="row padded-row">
          <Col md={6} s={12} xs={12}>
            <FormControl
              type="text"
              onChange={this.onCurrentUserIdChange}
              onKeyUp={this.onUserKeyUp}
              id="user-id-input"
            />
          </Col>
          <Col md={6} s={12} xs={12}>
            <Button onClick={this.onAddUser}>
              Add
            </Button>
          </Col>
        </Row>
        <Row bsClass="row padded-row">
          <Col md={12} s={12} xs={12}>
            <span>Record IDs</span>
          </Col>
        </Row>
        {this.renderRecordIds()}
        <Row bsClass="row padded-row">
          <Col md={6} s={12} xs={12}>
            <FormControl
              type="text"
              onChange={this.onCurrentRecordIdChange}
              onKeyUp={this.onRecordIdKeyUp}
              id="record-id-input"
            />
          </Col>
          <Col md={6} s={12} xs={12}>
            <Button onClick={this.onAddRecordId}>
              Add
            </Button>
          </Col>
        </Row>
        <Row bsClass="row padded-row">
          <Col md={4} s={12} xs={12}>
            <Button bsClass="btn btn-default btn-lg" onClick={this.filterQuery}>Filter</Button>
          </Col>
        </Row>
        <Table>
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
        </Table>
      </Grid>

    )
  }
}

export default AuditLogs
