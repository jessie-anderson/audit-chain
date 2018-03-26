import $ from 'jquery'
import path from 'path'
import { loadPage } from '../lib/electron-helpers'

$('#return').click(() => {
  loadPage(path.join(__dirname, '../main/main.jade'))
})
