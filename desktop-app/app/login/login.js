import { remote } from 'electron'
import path from 'path'
import $ from 'jquery'
import login from '../api/login'
import { getURLFromPathname } from '../lib/electron-helpers'

$('#signin-button').click(() => {
  const username = $('#username').val()
  const password = $('#password').val()
  login(username, password)
  .then((data) => {
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    const win = remote.getCurrentWindow()
    win.loadURL(getURLFromPathname(path.join(__dirname, '../index.jade')))
  })
  .catch((errResponse) => {
    $('#error-message').text(`Error: ${errResponse.statusText}`)
  })
})
