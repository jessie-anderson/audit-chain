import $ from 'jquery'
import path from 'path'
import { loadPage } from '../lib/electron-helpers'

function leavePage(pathname) {
  localStorage.removeItem('temp-username')
  localStorage.removeItem('temp-pwd')
  loadPage(pathname)
}

$('#return').click(() => {
  leavePage(path.join(__dirname, '../main/main.jade'))
})

$('#register-another').click(() => {
  leavePage(path.join(__dirname, 'register.jade'))
})

$('#temp-username').text(localStorage.getItem('temp-username'))

$('#temp-pwd').text(localStorage.getItem('temp-pwd'))
