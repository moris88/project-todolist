export function generateUniqueId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 7)
  return `${timestamp}-${random}`
}
