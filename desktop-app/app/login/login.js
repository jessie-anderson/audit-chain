import { remote } from 'electron'
import url from 'url'
import path from 'path'
import $ from 'jquery'
import login from '../api/login'

$('#signin-button').click(() => {
  const username = $('#username').val()
  const password = $('#password').val()
  login(username, password)
  .then(() => {
    const win = remote.getCurrentWindow()
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.jade'),
      protocol: 'file:',
      slashes: true,
    }))
  })
})
