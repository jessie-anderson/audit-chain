import mysql from 'mysql'
import Promise from 'bluebird'

export default function sqlQuery(queryString) {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'audit-chain',
  })

  return connection.connect((err) => {
    if (err) return Promise.reject(err)
    return connection.query(queryString, (err, results) => {
      if (err) return Promise.reject(err)
      return Promise.resolve(results)
    })
  })
}
