import type { OpeningWindow, Weekday } from '../config/site'

const toMinutes = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Dia da semana e minutos do dia no fuso informado, sem depender do fuso da máquina. */
export function zonedClock(date: Date, timeZone: string): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return {
    day: days.indexOf(get('weekday')) as Weekday,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

export function isOpenAt(date: Date, hours: readonly OpeningWindow[], timeZone: string): boolean {
  const { day, minutes } = zonedClock(date, timeZone)
  return hours.some(
    (w) => w.days.includes(day) && minutes >= toMinutes(w.opens) && minutes < toMinutes(w.closes),
  )
}
