// Voice guidance via the browser's built-in speech synthesis.
// Silently no-ops where unsupported so the demo never breaks.
const VOICE_LANG = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ur: 'ur-IN',
}

export function speak(text, lang = 'en') {
  try {
    const synth = window.speechSynthesis
    if (!synth || !text) return
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = VOICE_LANG[lang] ?? 'en-IN'
    u.rate = 0.95
    synth.speak(u)
  } catch {
    /* speech unavailable — ignore */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}
