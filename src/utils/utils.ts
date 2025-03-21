export function generateUniqueId() {
  // Ottieni il timestamp corrente
  const timestamp = Date.now().toString(36) // Base 36 per ridurre la lunghezza

  // Combina il timestamp e la stringa casuale per creare un ID unico
  return `${timestamp}`
}
