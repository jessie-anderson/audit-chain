export default function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.json('Unauthorized')
  }
}
