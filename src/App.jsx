import React, { useEffect, useState, useRef } from 'react'
import { Player } from 'lottie-react'
import AlarmForm from './components/AlarmForm'
import AlarmItem from './components/AlarmItem'
import lottieData from '../public/hero-lottie.json'

const STORAGE_KEY = 'alarm-desktop:alarms'

export default function App(){
  const [alarms, setAlarms] = useState([])
  const audioRef = useRef(null)

  useEffect(()=>{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw) setAlarms(JSON.parse(raw))
  },[])

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms))
  },[alarms])

  useEffect(()=>{
    const timer = setInterval(checkAlarms, 1000)
    return ()=> clearInterval(timer)
  },[alarms])

  function checkAlarms(){
    const now = new Date()
    const nowKey = `${now.getHours()}:${now.getMinutes()}`
    alarms.forEach(alarm=>{
      if(!alarm.enabled) return
      if(alarm.fired) return

      if(alarm.repeat === 'once'){
        if(alarm.time === nowKey && !alarm._firedOn?.includes(todayKey())){
          triggerAlarm(alarm.id)
        }
      } else {
        if(alarm.time === nowKey){
          // basic repeat: daily or weekdays
          if(alarm.repeat === 'daily') triggerAlarm(alarm.id)
          if(alarm.repeat === 'weekdays'){
            const d = now.getDay()
            if(d >= 1 && d <=5) triggerAlarm(alarm.id)
          }
        }
      }
    })
  }

  function todayKey(){
    const d = new Date()
    return d.toDateString()
  }

  function triggerAlarm(id){
    setAlarms(prev=>prev.map(a=> a.id===id ? {...a, fired:true, _firedOn:[...(a._firedOn||[]), todayKey()]} : a))
    // play sound
    if(audioRef.current) audioRef.current.play().catch(()=>{})
    // browser notification
    if('Notification' in window){
      if(Notification.permission === 'granted'){
        new Notification('Alarm', { body: alarms.find(a=>a.id===id)?.label || 'Alarm' })
      } else if(Notification.permission !== 'denied'){
        Notification.requestPermission().then(p=>{
          if(p === 'granted') new Notification('Alarm', { body: alarms.find(a=>a.id===id)?.label || 'Alarm' })
        })
      }
    }
  }

  function addAlarm(obj){
    const id = Date.now().toString()
    setAlarms(a=>[...a, { id, enabled:true, fired:false, _firedOn:[], ...obj }])
  }

  function updateAlarm(id, changes){
    setAlarms(a=>a.map(x=> x.id===id ? {...x, ...changes} : x))
  }

  function removeAlarm(id){
    setAlarms(a=>a.filter(x=> x.id!==id))
  }

  function snooze(id, minutes=5){
    const alarm = alarms.find(a=>a.id===id)
    if(!alarm) return
    const next = new Date()
    next.setMinutes(next.getMinutes()+minutes)
    const time = `${next.getHours()}:${next.getMinutes()}`
    updateAlarm(id, { time, fired:false })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#071032] text-white p-6">
      <div className="max-w-4xl mx-auto bg-white/5 rounded-2xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex gap-6 items-center">
          <div className="w-48 h-48">
            <Player autoplay loop src={lottieData} />
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
