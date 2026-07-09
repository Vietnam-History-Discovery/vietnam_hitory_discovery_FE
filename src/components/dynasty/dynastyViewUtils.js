export function getChunkText(chunk) {
  if (typeof chunk === 'string') return chunk
  if (!chunk || typeof chunk !== 'object') return ''
  return chunk.text ?? ''
}

export function getChunkTitle(chunk, index) {
  if (chunk && typeof chunk === 'object' && chunk.title) return chunk.title
  return `Trích đoạn sử liệu ${index + 1}`
}

export function getChunkSource(chunk, fallback = 'DVSKTT') {
  if (chunk && typeof chunk === 'object' && chunk.source) return chunk.source
  return fallback
}
