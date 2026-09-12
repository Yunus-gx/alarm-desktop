import React from 'react'

export default function AlarmItem({ alarm, onToggle, onDelete, onSnooze, onEdit }){
  return (
    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
      <div>
        <div className="text-lg font-medium">{alarm.label || 'Alarm'}</div>
        <div className="text-sm text-slate-300">{alarm.time} • {alarm.repeat}</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 bg-slate-700 rounded" onClick={onSnooze}>Snooze</button>
        <button className="px-3 py-1 bg-slate-700 rounded" onClick={onToggle}>{alarm.enabled? 'Disable' : 'Enable'}</button>
        <button className="px-3 py-1 bg-red-600 rounded" onClick={onDelete}>Delete</button>
      </div>
    </div>
  )
}
