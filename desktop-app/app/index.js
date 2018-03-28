import { remote } from 'electron'
import path from 'path'
import _ from 'lodash'
import { getURLFromPathname } from './lib/electron-helpers'

const win = remote.getCurrentWindow()
let pathname

if (!_.isNil(localStorage.getItem('token')) && !_.isNil(localStorage.getItem('user'))) {
  if (JSON.parse(localStorage.getItem('user')).hasChangedPassword) {
    pathname = path.join(__dirname, 'main/main.jade')
  } else {
    pathname = path.join(__dirname, 'enroll/enroll.jade')
  }
} else {
  pathname = path.join(__dirname, 'login/login.jade')
}

win.loadURL(getURLFromPathname(pathname))
