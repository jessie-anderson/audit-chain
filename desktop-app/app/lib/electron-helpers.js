import url from 'url'
import { remote } from 'electron'

export function loadPage(pathname) {
  const win = remote.getCurrentWindow()
  win.loadURL(url.format({
    pathname,
    protocol: 'file:',
    slashes: true,
  }))
}

export function getURLFromPathname(pathname) {
  return url.format({
    pathname,
    protocol: 'file:',
    slashes: true,
  })
}
