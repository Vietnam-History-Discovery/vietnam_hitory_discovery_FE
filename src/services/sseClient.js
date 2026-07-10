import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from './authService'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Generic SSE POST client — no chat/timeline knowledge. Any future streaming
// mode reuses this by pointing it at its own endpoint + body shape.
export async function streamRequest(path, body, { onMeta, onDelta, onDone, onError, onEvent } = {}) {
  const token = await getToken()

  await fetchEventSource(`${baseURL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    openWhenHidden: true,
    onmessage(ev) {
      const data = ev.data ? JSON.parse(ev.data) : {}
      if (ev.event === 'meta') onMeta?.(data)
      else if (ev.event === 'delta') onDelta?.(data.text)
      else if (ev.event === 'done') onDone?.()
      else if (ev.event === 'error') onError?.(data.message)
      else onEvent?.(ev.event, data)
    },
    onerror(err) {
      onError?.(err?.message ?? String(err))
      throw err // stop fetch-event-source's built-in retry loop
    },
  })
}
