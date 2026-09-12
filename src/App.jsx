import React, { useEffect, useState, useRef } from 'react'
import AlarmForm from './components/AlarmForm'
import AlarmItem from './components/AlarmItem'
import lottieData from './assets/hero-lottie.json'

const STORAGE_KEY = 'alarm-desktop:alarms'
const VALID_REPEAT_OPTIONS = new Set(['once', 'daily', 'weekdays'])

function pad2(value){
  return String(value).padStart(2, '0')
}

function toTimeKey(date){
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function normalizeTime(time){
  if(typeof time !== 'string') return null
  const [rawHour, rawMinute] = time.split(':')
  const hour = Number(rawHour)
  const minute = Number(rawMinute)
  if(!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if(hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return `${pad2(hour)}:${pad2(minute)}`
}

function normalizeAlarm(alarm){
  if(!alarm || typeof alarm !== 'object') return null
  const time = normalizeTime(alarm.time)
  if(!time) return null
  const repeat = VALID_REPEAT_OPTIONS.has(alarm.repeat) ? alarm.repeat : 'daily'
  const idValue = alarm.id ?? Date.now().toString()
  const id = typeof idValue === 'string' ? idValue : String(idValue)
  return {
    id,
    time,
    label: typeof alarm.label === 'string' ? alarm.label : 'Alarm',
    repeat,
    enabled: alarm.enabled !== false,
    fired: Boolean(alarm.fired),
    _firedOn: Array.isArray(alarm._firedOn) ? alarm._firedOn.filter(x=>typeof x === 'string') : [],
  }
}

export default function App(){
  const [alarms, setAlarms] = useState([])
  const audioRef = useRef(null)
  const [LottieComponent, setLottieComponent] = useState(null)
  const [lottieFailed, setLottieFailed] = useState(false)

  useEffect(()=>{
    let active = true
    import('lottie-react')
      .then(mod=>{
        if(!active) return
        if(mod?.default){
          setLottieComponent(()=>mod.default)
        } else {
          setLottieFailed(true)
        }
      })
      .catch(()=>{
        if(active) setLottieFailed(true)
      })
    return ()=>{ active = false }
  },[])

  useEffect(()=>{
    if(typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if(!raw) return
      const parsed = JSON.parse(raw)
      if(!Array.isArray(parsed)) return
      setAlarms(parsed.map(normalizeAlarm).filter(Boolean))
    } catch (error) {
      console.error('Failed to load alarms from localStorage', error)
    }
  },[])

  useEffect(()=>{
    if(typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
    } catch (error) {
      console.error('Failed to persist alarms', error)
    }
  },[alarms])

  useEffect(()=>{
    const timer = setInterval(checkAlarms, 1000)
    return ()=> clearInterval(timer)
  },[alarms])

  function checkAlarms(){
    const now = new Date()
    const nowKey = toTimeKey(now)
    const today = todayKey(now)
    alarms.forEach(alarm=>{
      if(!alarm || typeof alarm !== 'object') return
      if(!alarm.enabled) return
      if(alarm.fired) return
      const alarmTime = normalizeTime(alarm.time)
      if(!alarmTime || alarmTime !== nowKey) return
      const firedOn = Array.isArray(alarm._firedOn) ? alarm._firedOn : []

      if(alarm.repeat === 'once'){
        if(!firedOn.includes(today)){
          triggerAlarm(alarm.id)
        }
      } else {
        if(alarm.repeat === 'daily') triggerAlarm(alarm.id)
        if(alarm.repeat === 'weekdays'){
          const d = now.getDay()
          if(d >= 1 && d <=5) triggerAlarm(alarm.id)
        }
      }
    })
  }

  function todayKey(d = new Date()){
    return d.toDateString()
  }

  function triggerAlarm(id){
    const today = todayKey()
    setAlarms(prev=>prev.map(a=>{
      if(!a || a.id !== id) return a
      const firedOn = Array.isArray(a._firedOn) ? a._firedOn : []
      const nextFiredOn = firedOn.includes(today) ? firedOn : [...firedOn, today]
      return { ...a, fired: true, _firedOn: nextFiredOn }
    }))
    // play sound
    if(audioRef.current){
      try {
        const playResult = audioRef.current.play()
        if(playResult?.catch) playResult.catch(()=>{})
      } catch (error) {
        console.error('Failed to play alarm audio', error)
      }
    }
    // browser notification
    if(typeof window !== 'undefined' && 'Notification' in window){
      const label = alarms.find(a=>a.id===id)?.label || 'Alarm'
      try {
        if(Notification.permission === 'granted'){
          new Notification('Alarm', { body: label })
        } else if(Notification.permission !== 'denied'){
          Notification.requestPermission()
            .then(p=>{
              if(p === 'granted') new Notification('Alarm', { body: label })
            })
            .catch(()=>{})
        }
      } catch (error) {
        console.error('Failed to show notification', error)
      }
    }
  }

  function addAlarm(obj){
    const id = Date.now().toString()
    const time = normalizeTime(obj?.time) || toTimeKey(new Date())
    const repeat = VALID_REPEAT_OPTIONS.has(obj?.repeat) ? obj.repeat : 'daily'
    const label = typeof obj?.label === 'string' ? obj.label : ''
    setAlarms(a=>[...a, { id, enabled:true, fired:false, _firedOn:[], time, label, repeat }])
  }

  function updateAlarm(id, changes){
    setAlarms(a=>a.map(x=>{
      if(!x || x.id !== id) return x
      const next = { ...x, ...changes }
      if('time' in changes){
        next.time = normalizeTime(changes.time) || x.time
      }
      if('repeat' in changes){
        next.repeat = VALID_REPEAT_OPTIONS.has(changes.repeat) ? changes.repeat : x.repeat
      }
      return next
    }))
  }

  function removeAlarm(id){
    setAlarms(a=>a.filter(x=> x.id!==id))
  }

  function snooze(id, minutes=5){
    const alarm = alarms.find(a=>a.id===id)
    if(!alarm) return
    const next = new Date()
    next.setMinutes(next.getMinutes()+minutes)
    const time = toTimeKey(next)
    updateAlarm(id, { time, fired:false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#071032] text-white p-6">
      <div className="max-w-4xl mx-auto bg-white/5 rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex gap-6 items-center">
          <div className="w-48 h-48">
            {LottieComponent && !lottieFailed ? (
              <LottieComponent animationData={lottieData} autoplay loop />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-800/60 border border-white/10 flex items-center justify-center text-slate-300 text-sm">
                Alarm Desktop
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Alarm Desktop</h1>
            <p className="text-slate-300 mt-1">Beautiful alarms with smooth animations and simple scheduling.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Alarms</h2>
            </div>

            <div className="mt-4 space-y-3">
              {alarms.length === 0 && <p className="text-slate-400">No alarms yet — add one!</p>}
              {alarms.map(a=> (
                <AlarmItem key={a.id} alarm={a} onToggle={() => updateAlarm(a.id, { enabled: !a.enabled })} onDelete={() => removeAlarm(a.id)} onSnooze={() => snooze(a.id)} onEdit={(changes)=> updateAlarm(a.id, changes)} />
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/3 rounded-lg">
            <AlarmForm onSubmit={addAlarm} />
          </div>
        </div>

      </div>
      <audio ref={audioRef} src="/ringtones/bell.mp3" />
    </div>
  )
}
