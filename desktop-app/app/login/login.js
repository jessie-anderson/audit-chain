import login from '../api/login'

document.getElementById('signin-button').addEventListener('click', () => {
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  login(username, password)
})
