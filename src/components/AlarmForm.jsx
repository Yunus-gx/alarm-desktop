import React, { useState } from 'react'

export default function AlarmForm({ onSubmit }){
  const [time, setTime] = useState( new Date().toTimeString().slice(0,5) )
  const [label, setLabel] = useState('Morning Alarm')
  const [repeat, setRepeat] = useState('daily')

  function submit(e){
    e.preventDefault()
    onSubmit({ time, label, repeat })
    setLabel('')
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm text-slate-300">Time</label>
        <input required value={time} onChange={e=>setTime(e.target.value)} type="time" className="w-full mt-1 p-2 rounded bg-white/5" />
      </div>

      <div>
        <label className="block text-sm text-slate-300">Label</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label" className="w-full mt-1 p-2 rounded bg-white/5" />
      </div>

      <div>
        <label className="block text-sm text-slate-300">Repeat</label>
        <select value={repeat} onChange={e=>setRepeat(e.target.value)} className="w-full mt-1 p-2 rounded bg-white/5">
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
        </select>
      </div>

      <button className="w-full py-2 bg-emerald-500 rounded font-semibold">Add Alarm</button>
    </form>
  )
}
