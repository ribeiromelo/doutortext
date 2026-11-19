export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
}

// JSON is JavaScript-safe, but must also be safe for the HTML script parser.
export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}

export function validNote(body: any): boolean {
  return (body.title === undefined || typeof body.title === 'string' && body.title.length <= 300) &&
    (body.content === undefined || typeof body.content === 'string' && body.content.length <= 500000)
}

export function validId(value: unknown): boolean {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

// Restricted shares are deliberately unavailable until email verification exists.
export function publicShareAllowed(share: any): boolean {
  return !share.shared_with_email
}
