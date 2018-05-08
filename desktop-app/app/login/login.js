import path from 'path'
import $ from 'jquery'
import login from '../api/login'
import { loadPage } from '../lib/electron-helpers'

$('#signin-form').submit(() => {
  attemptLogin()
  return false
})

function attemptLogin() {
  const username = $('#username').val()
  const password = $('#password').val()
  login(username, password)
  .then((data) => {
    console.log(data)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    loadPage(path.join(__dirname, '../index.jade'))
  })
  .catch((errResponse) => {
    $('#error-message').text(`Error: ${errResponse.statusText}`)
  })
}
