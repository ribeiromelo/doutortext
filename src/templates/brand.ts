// The supplied mark is framed using its visible bounds, without altering the source image.
export function brandLogo(tone: 'green' | 'white' = 'green') {
  return `<span class="dt-logo dt-logo--${tone}" role="img" aria-label="DoutorText"><img src="/static/brand/doutortext.png" width="2172" height="724" alt="" decoding="async"></span>`
}
