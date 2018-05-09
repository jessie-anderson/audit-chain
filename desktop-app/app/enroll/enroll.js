import $ from 'jquery'
import path from 'path'
import enroll from '../api/enroll'
import { loadPage } from '../lib/electron-helpers'

$('#enroll-user-form').submit(() => {
  console.log('submit')
  const username1 = $('#username-1').val()
  const username2 = $('#username-2').val()
  const password1 = $('#password-1').val()
  const password2 = $('#password-2').val()

  if (username1 !== username2) {
    $('#username-error').text('Usernames do not match')
  }
  if (password1 !== password2) {
    $('#password-error').text('Passwords do not match')
  }

  if (username1 === username2 && password1 === password2) {
    enroll(username1, password1)
    .then((data) => {
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      loadPage(path.join(__dirname, '../main/main.jade'))
    })
    .catch((errResponse) => {
      $('#request-error').text(`Error: ${errResponse.statusText}`)
    })
  }
  return false
})

// $('#enroll-button').click(() => {
//   const username1 = $('#username-1').val()
//   const username2 = $('#username-2').val()
//   const password1 = $('#password-1').val()
//   const password2 = $('#password-2').val()
//
//   if (username1 !== username2) {
//     $('#username-error').text('Usernames do not match')
//   }
//   if (password1 !== password2) {
//     $('#password-error').text('Passwords do not match')
//   }
//
//   if (username1 === username2 && password1 === password2) {
//     enroll(username1, password1)
//     .then((data) => {
//       localStorage.setItem('user', JSON.stringify(data.user))
//       localStorage.setItem('token', data.token)
//       loadPage(path.join(__dirname, '../main/main.jade'))
//     })
//     .catch((errResponse) => {
//       $('#request-error').text(`Error: ${errResponse.statusText}`)
//     })
//   }
// })
