/**
 * Pronunciation comes from the browser's built-in speechSynthesis engine —
 * whatever Japanese voice the OS ships (Edge/Windows: Nanami, Keita, Haruka;
 * macOS: Kyoko, Otoya). It is a formant/neural TTS, not a recorded dictionary
 * clip, so the vowel quality is fine but the pitch accent is the engine's own
 * guess and can differ from the dictionary for a word it has not seen.
 *
 * The voice list is exposed so the user can pick a different engine: quality
 * varies a lot between them, and there is nothing we can do about a bad one
 * except let them switch.
 */

const VOICE_KEY = "wb.vocab.voice.v1";

let cachedVoice: SpeechSynthesisVoice | null = null;
let preferredName: string | null = null;
let primed = false;

const PREFERRED_ORDER = [
  "nanami",
  "keita",
  "haruka",
  "ayumi",
  "ichiro",
  "kyoko",
  "otoya",
  "google 日本語",
];

function jaVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("ja"));
}

export interface VoiceOption {
  name: string;
  lang: string;
  /** False for the robotic legacy engines shipped with some systems. */
  natural: boolean;
}

export function listJaVoices(): VoiceOption[] {
  return jaVoices()
    .map((v) => ({
      name: v.name,
      lang: v.lang,
      natural: !/compact|espeak|pico/i.test(v.name),
    }))
    .sort((a, b) => {
      if (a.natural !== b.natural) return a.natural ? -1 : 1;
      const ia = PREFERRED_ORDER.findIndex((p) => a.name.toLowerCase().includes(p));
      const ib = PREFERRED_ORDER.findIndex((p) => b.name.toLowerCase().includes(p));
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
}

function pickVoice(): SpeechSynthesisVoice | null {
  const ja = jaVoices();
  if (!ja.length) return null;
  if (preferredName) {
    const hit = ja.find((v) => v.name === preferredName);
    if (hit) return hit;
  }
  for (const name of PREFERRED_ORDER) {
    const hit = ja.find((v) => v.name.toLowerCase().includes(name));
    if (hit) return hit;
  }
  return ja[0];
}

export function primeVoices(): void {
  if (primed || typeof window === "undefined" || !window.speechSynthesis) return;
  primed = true;
  try {
    preferredName = localStorage.getItem(VOICE_KEY);
  } catch {
    preferredName = null;
  }
  cachedVoice = pickVoice();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoice = pickVoice();
  });
}

export function hasJapaneseVoice(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return cachedVoice !== null || pickVoice() !== null;
}

export function getVoiceName(): string | null {
  return (cachedVoice ?? pickVoice())?.name ?? null;
}

export function setVoice(name: string | null): void {
  preferredName = name;
  try {
    if (name) localStorage.setItem(VOICE_KEY, name);
    else localStorage.removeItem(VOICE_KEY);
  } catch {
    /* ignore */
  }
  cachedVoice = pickVoice();
}

export function speakJa(text: string, rate = 0.9): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const clean = text.trim();
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = "ja-JP";
  utter.rate = rate;
  utter.pitch = 1;
  const voice = cachedVoice ?? pickVoice();
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
