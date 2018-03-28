import $ from 'jquery'
import path from 'path'
import { loadPage } from '../lib/electron-helpers'
import registerUser from '../api/register-user'

let role = null

function radioClick() {
  if (this.checked) {
    role = this.value
  }
}

$('#return').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})

$('#admin-role').click(radioClick)

$('#patient-role').click(radioClick)

$('#doctor-role').click(radioClick)

$('#submit-registration').click(() => {
  const fname = $('#fname').val()
  const lname = $('#lname').val()
  const userId = $('#user-id').val()
  const npi = $('#npi').val()

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
})
