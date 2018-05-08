import $ from 'jquery'
import path from 'path'
import { loadPage } from '../lib/electron-helpers'

function leavePage(pathname) {
  localStorage.removeItem('temp-username')
  localStorage.removeItem('temp-pwd')
  loadPage(pathname)
}

$('#signout-button').click(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  leavePage(path.join(__dirname, '../index.jade'))
})

$('#go-home').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})

$('#register-user').click(() => {
  leavePage(path.join(__dirname, '../register/register.jade'))
})

$('#view-logs').click(() => {
  leavePage(path.join(__dirname, '../logs/logs.jade'))
})

if (JSON.parse(localStorage.getItem('user')).role !== 'admin') {
  $('#register-user').hide()
}

$('#temp-username').text(localStorage.getItem('temp-username'))

$('#temp-pwd').text(localStorage.getItem('temp-pwd'))
