import path from 'path'
import $ from 'jquery'
import { loadPage } from '../lib/electron-helpers'

$('#signout-button').click(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  loadPage(path.join(__dirname, '../index.jade'))
})

$('#register-user').click(() => {
  loadPage(path.join(__dirname, '../register/register.jade'))
})

$('#view-logs').click(() => {
  loadPage(path.join(__dirname, '../logs/logs.jade'))
})

if (JSON.parse(localStorage.getItem('user')).role !== 'admin') {
  $('#register-user').hide()
}
