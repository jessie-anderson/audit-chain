import $ from 'jquery'
import path from 'path'
import ReactDOM from 'react-dom'
import React from 'react'
import { loadPage } from '../lib/electron-helpers'
import AuditLogs from './audit-logs'

$('#signout-button').click(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  loadPage(path.join(__dirname, '../index.jade'))
})

$('#register-user').click(() => {
  loadPage(path.join(__dirname, '../register/register.jade'))
})

$('#go-home').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})

if (JSON.parse(localStorage.getItem('user')).role !== 'admin') {
  $('#register-user').hide()
}

ReactDOM.render(<AuditLogs />, $('#logs-container').get(0))
