import { remote } from 'electron'
import path from 'path'
import url from 'url'
import _ from 'lodash'

const win = remote.getCurrentWindow()
let pathname

if (!_.isNil(localStorage.getItem('token'))) {
  pathname = path.join(__dirname, 'main/main.jade')
} else {
  pathname = path.join(__dirname, 'login/login.jade')
}

win.loadURL(url.format({
  pathname,
  protocol: 'file:',
  slashes: true,
}))
