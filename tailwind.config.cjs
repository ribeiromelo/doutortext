module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      brand: {50:'#eff9f5',100:'#d7f1e5',200:'#afe3cc',300:'#79d1ad',400:'#3fba8d',500:'#078663',600:'#006c50',700:'#00523e',800:'#003d30',900:'#002d25'},
      dark: {50:'#f5f7f6',100:'#edf1ef',200:'#dfe5e2',300:'#8b9e94',400:'#6a7e73',500:'#52665c',600:'#3c5146',700:'#293e33',800:'#1b2e24',900:'#12241a'}
    },
    fontFamily: {sans:['Manrope','sans-serif'],mono:['ui-monospace','monospace']}
  }}
}
