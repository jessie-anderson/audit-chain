import { remote } from 'electron'
import url from 'url'
import path from 'path'
import $ from 'jquery'

$('#signout-button').click(() => {
  localStorage.removeItem('token')
  const win = remote.getCurrentWindow()
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.jade'),
    protocol: 'file:',
    slashes: true,
  }))
})
