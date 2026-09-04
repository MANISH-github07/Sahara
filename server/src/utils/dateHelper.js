/** Format a Date to YYYY-MM-DD */
const format = (date) => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/** Subtract N days from a date */
const subDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() - n)
  return d
}

/** Start of current calendar month */
const startOfMonth = (date) => {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** Start of current week (Monday) */
const startOfWeek = (date) => {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Is date1 after date2? */
const isAfter = (date1, date2) => new Date(date1) > new Date(date2)

module.exports = { format, subDays, startOfMonth, startOfWeek, isAfter }
