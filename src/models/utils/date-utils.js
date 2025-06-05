/**
 * Date utility functions for SchoolGantt application
 * Provides date manipulation, formatting, and business logic
 */

/**
 * Convert date to ISO string safely
 */
export function toISOString(date) {
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString()
}

/**
 * Add days to a date
 */
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add weeks to a date
 */
export function addWeeks(date, weeks) {
  return addDays(date, weeks * 7)
}

/**
 * Add months to a date
 */
export function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Calculate difference in days between two dates
 */
export function diffInDays(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(date2) - new Date(date1)) / oneDay)
}

/**
 * Calculate difference in hours between two dates
 */
export function diffInHours(date1, date2) {
  const oneHour = 60 * 60 * 1000
  return Math.round((new Date(date2) - new Date(date1)) / oneHour)
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date) {
  const day = new Date(date).getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Check if a date is a weekday
 */
export function isWeekday(date) {
  return !isWeekend(date)
}

/**
 * Get working days between two dates (excluding weekends)
 */
export function getWorkingDays(startDate, endDate, excludeWeekends = true) {
  let count = 0
  const start = new Date(startDate)
  const end = new Date(endDate)

  while (start <= end) {
    if (!excludeWeekends || !isWeekend(start)) {
      count++
    }
    start.setDate(start.getDate() + 1)
  }
  return count
}

/**
 * Get the start of day for a given date
 */
export function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get the end of day for a given date
 */
export function endOfDay(date) {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Get the start of week (Monday) for a given date
 */
export function startOfWeek(date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  result.setDate(diff)
  return startOfDay(result)
}

/**
 * Get the end of week (Sunday) for a given date
 */
export function endOfWeek(date) {
  const start = startOfWeek(date)
  return endOfDay(addDays(start, 6))
}

/**
 * Get the start of month for a given date
 */
export function startOfMonth(date) {
  const result = new Date(date)
  result.setDate(1)
  return startOfDay(result)
}

/**
 * Get the end of month for a given date
 */
export function endOfMonth(date) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + 1, 0)
  return endOfDay(result)
}

/**
 * Format date for display
 */
export function formatDate(date, format = 'short') {
  const d = new Date(date)
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString()
    case 'long':
      return d.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'iso':
      return d.toISOString().split('T')[0]
    case 'time':
      return d.toLocaleTimeString()
    case 'datetime':
      return d.toLocaleString()
    default:
      return d.toLocaleDateString()
  }
}

/**
 * Check if a date is today
 */
export function isToday(date) {
  const today = new Date()
  const checkDate = new Date(date)
  return checkDate.toDateString() === today.toDateString()
}

/**
 * Check if a date is in the past
 */
export function isPast(date) {
  return new Date(date) < new Date()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date) {
  return new Date(date) > new Date()
}

/**
 * Check if a date is overdue (past due date)
 */
export function isOverdue(dueDate) {
  if (!dueDate) return false
  return isPast(dueDate) && !isToday(dueDate)
}

/**
 * Get relative time description (e.g., "2 days ago", "in 3 days")
 */
export function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diffMs = target - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

/**
 * Calculate academic semester dates
 */
export function getAcademicSemesterDates(year, semester) {
  const semesterMap = {
    'spring': { start: [year, 0, 15], end: [year, 4, 15] }, // Jan 15 - May 15
    'summer': { start: [year, 5, 1], end: [year, 7, 15] },  // Jun 1 - Aug 15
    'fall': { start: [year, 7, 15], end: [year + 1, 0, 15] } // Aug 15 - Jan 15 (next year)
  }
  
  const dates = semesterMap[semester.toLowerCase()]
  if (!dates) return null
  
  return {
    start: new Date(...dates.start),
    end: new Date(...dates.end)
  }
}

/**
 * Generate date range for timeline views
 */
export function generateDateRange(startDate, endDate, interval = 'day') {
  const dates = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    dates.push(new Date(current))
    
    switch (interval) {
      case 'day':
        current.setDate(current.getDate() + 1)
        break
      case 'week':
        current.setDate(current.getDate() + 7)
        break
      case 'month':
        current.setMonth(current.getMonth() + 1)
        break
      default:
        current.setDate(current.getDate() + 1)
    }
  }
  
  return dates
}

/**
 * Validate date string format
 */
export function isValidDate(dateString) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Default export with all date utilities
 */
export const DateUtils = {
  toISOString,
  addDays,
  addWeeks,
  addMonths,
  diffInDays,
  diffInHours,
  isWeekend,
  isWeekday,
  getWorkingDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatDate,
  isToday,
  isPast,
  isFuture,
  isOverdue,
  getRelativeTime,
  getAcademicSemesterDates,
  generateDateRange,
  isValidDate
}
