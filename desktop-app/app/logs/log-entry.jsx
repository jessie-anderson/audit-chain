import React from 'react'

const LogEntry = (props) => {
  const log = props.log
  console.log(log)

  return (
    <div>
      <span>{log.value.actionType}</span>
      <span>{log.value.dataType}</span>
    </div>
  )
}

export default LogEntry
