import React from 'react'

const LogEntry = (props) => {
  const log = props.log

  return (
    <div>
      <span>{log.value.update.actionType}</span>
      <span>{log.value.update.dataType}</span>
    </div>
  )
}

export default LogEntry
