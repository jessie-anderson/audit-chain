import $ from 'jquery'
import path from 'path'
import ReactDOM from 'react-dom'
import React from 'react'
import { loadPage } from '../lib/electron-helpers'
import AuditLogs from './audit-logs'

$('#return').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})

ReactDOM.render(<AuditLogs />, $('#logs-container').get(0))
