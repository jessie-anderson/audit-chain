import $ from 'jquery'
import path from 'path'
import { loadPage } from '../lib/electron-helpers'
import registerUser from '../api/register-user'

$('#register-user-form').submit(() => {
  const fname = $('#fname').val()
  const lname = $('#lname').val()
  const userId = $('#user-id').val()
  const npi = $('#npi').val()
  const role = $('#role').val().toLowerCase()

  registerUser({ fname, lname, npi, userId, role })
  .then((result) => {
    localStorage.setItem('temp-username', result.username)
    localStorage.setItem('temp-pwd', result.tempPassword)
    loadPage(path.join(__dirname, 'registration-success.jade'))
  })
  .catch((errorResponse) => {
    console.log('error')
    console.log(errorResponse)
  })
  return false
})

$('#signout-button').click(() => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  loadPage(path.join(__dirname, '../index.jade'))
})

$('#go-home').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})

$('#view-logs').click(() => {
  loadPage(path.join(__dirname, '../logs/logs.jade'))
})

if (JSON.parse(localStorage.getItem('user')).role !== 'admin') {
  $('#register-user').hide()
}
