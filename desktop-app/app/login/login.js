import { remote } from 'electron'
import url from 'url'
import path from 'path'
import login from '../api/login'

document.getElementById('signin-button').addEventListener('click', () => {
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
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
