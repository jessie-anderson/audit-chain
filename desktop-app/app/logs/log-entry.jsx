import React from 'react'

const LogEntry = (props) => {
  const log = props.log

  return (
    <div>
      <span>Action: {log.value.actionType}, </span>
      <span>Data Type: {log.value.dataType}, </span>
      <span>Data entry method: {log.value.entryMethod}, </span>
      <span>User: {log.value.userId}</span>
    </div>
  )
}

export default LogEntry
