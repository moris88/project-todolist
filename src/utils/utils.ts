import moment from 'moment'

export const priorityItems = ['urgent', 'high', 'medium', 'low']

export function isTaskOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return moment().isAfter(dueDate)
}

export function generateUniqueId() {
  // Ottieni il timestamp corrente
  const timestamp = Date.now().toString(36) // Base 36 per ridurre la lunghezza

  // Genera una stringa casuale
  const randomString = Math.random().toString(36).substring(2, 10) // Random a base 36

  // Combina il timestamp e la stringa casuale per creare un ID unico
  return `${timestamp}-${randomString}`
}
