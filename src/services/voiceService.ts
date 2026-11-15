import { AppView, LanguageCode } from "../types";
import { apiUrl } from "./apiConfig";

export interface VoicePlaybackResult {
  provider: string;
  voiceId?: string;
  missingNativeVoice?: boolean;
  limitationNotice?: string;
}

export interface LanguageSpeechSupport {
  language: LanguageCode;
  browserVoicesFound: string[];
  hasBrowserTts: boolean;
  hasBrowserStt: boolean;
  hasServerTts: boolean;
  hasServerStt: boolean;
  hasLiveApi: boolean;
  synthesisStatus: "cloud-and-device" | "cloud-only" | "device-only" | "unavailable";
  recognitionStatus: "cloud-and-browser" | "cloud-only" | "browser-only" | "unavailable";
  limitationNotice: string;
  fallbackNotice: string;
}

export interface VoiceListenResult {
  transcript: string;
  localizedTranscript?: string;
  provider: string;
  micError?: string;
  cancelled?: boolean;
}

export interface OnboardingFieldIntent {
  command: "fill" | "next" | "back" | "repeat" | "submit";
  filledValue: string;
  matchedItems: string[];
  confirmationText: string;
}

export interface VoiceNavIntent {
  action:
    | "navigate"
    | "read_major_options"
    | "read_specific"
    | "enroll_course"
    | "complete_lesson"
    | "save_job"
    | "apply_job"
    | "check_in"
    | "ask_ai"
    | "stop"
    | "unknown";
  targetView: AppView | "";
  itemNumber: number;
  queryText: string;
  replyText: string;
}

let activeAudio: HTMLAudioElement | null = null;
let activeListeningCleanup: (() => void) | null = null;
let activeListeningFinish: (() => void) | null = null;

export function stopAllVoicePlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function stopActiveListening() {
  if (activeListeningCleanup) {
    activeListeningCleanup();
    activeListeningCleanup = null;
  }
  activeListeningFinish = null;
}

export function finishCurrentListeningNow() {
  if (activeListeningFinish) {
    activeListeningFinish();
  }
}

export const LOCALE_MAP: Record<LanguageCode, string> = {
  en: "en-US",
  am: "am-ET",
  om: "om-ET",
  ar: "ar-SA",
  fr: "fr-FR",
  sw: "sw-KE",
  so: "so-SO",
  ti: "ti-ET",
};

export function playAccessibleAudioCue(
  cue: "start" | "capture" | "stop" | "hazard" | "language"
) {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const freqMap: Record<typeof cue, [number, number]> = {
      start: [520, 680],
      capture: [640, 820],
      stop: [440, 310],
      hazard: [780, 580],
      language: [560, 720],
    };
    const [f1, f2] = freqMap[cue];
    osc.type = cue === "hazard" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.exponentialRampToValueAtTime(f2, now + 0.11);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.17);
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 220);
  } catch {
    // Ignore audio context restrictions
  }
}

async function getLoadedVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const immediate = window.speechSynthesis.getVoices();
  if (immediate.length > 0) return immediate;
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = done;
    window.setTimeout(done, 450);
  });
}

export async function inspectLanguageSpeechSupport(
  language: LanguageCode
): Promise<LanguageSpeechSupport> {
  const voices = await getLoadedVoices();
  const baseCode = language.toLowerCase();
  const matching = voices.filter((v) => {
    const vl = (v.lang || "").toLowerCase();
    return vl === baseCode || vl.startsWith(`${baseCode}-`) || vl.startsWith(`${baseCode}_`);
  });

  const hasSpeechRec =
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );

  let hasGemini = false;
  let hasAddisAI = false;
  let supportsLiveWebSocket = false;
  try {
    const res = await fetch(apiUrl("/api/health"));
    if (res.ok) {
      const h = (await res.json()) as {
        hasGemini?: boolean;
        hasAddisAI?: boolean;
        supportsLiveWebSocket?: boolean;
      };
      hasGemini = Boolean(h.hasGemini);
      hasAddisAI = Boolean(h.hasAddisAI);
      supportsLiveWebSocket = Boolean(h.supportsLiveWebSocket);
    }
  } catch {
    // Server check failed; report honestly
  }

  const hasBrowserTts = matching.length > 0;
  const hasServerTts =
    hasGemini || (hasAddisAI && (language === "am" || language === "om" || language === "ti"));
  const hasServerStt = hasGemini;

  let synthesisStatus: LanguageSpeechSupport["synthesisStatus"] = "unavailable";
  if (hasServerTts && hasBrowserTts) synthesisStatus = "cloud-and-device";
  else if (hasServerTts) synthesisStatus = "cloud-only";
  else if (hasBrowserTts) synthesisStatus = "device-only";

  // Web Speech API rarely supports Afaan Oromo/Tigrinya/Somali natively across browsers
  const browserSttReliable = hasSpeechRec && ["en", "ar", "fr", "sw", "am"].includes(language);
  let recognitionStatus: LanguageSpeechSupport["recognitionStatus"] = "unavailable";
  if (hasServerStt && browserSttReliable) recognitionStatus = "cloud-and-browser";
  else if (hasServerStt) recognitionStatus = "cloud-only";
  else if (browserSttReliable) recognitionStatus = "browser-only";

  let limitationNotice = "";
  let fallbackNotice = "";

  if (!hasBrowserTts && !hasServerTts) {
    limitationNotice = `No native browser voice or cloud TTS voice is available for this language (${language}) on this device right now.`;
    fallbackNotice =
      "Responses will not be silently switched to another language voice. Full descriptions are shown in accessible text & screen-reader live regions, and you can connect Gemini or Addis AI keys on the backend for spoken output.";
  } else if (!hasBrowserTts && hasServerTts) {
    limitationNotice = `This browser has no built-in offline voice for (${language}); spoken audio relies on the backend AI voice service.`;
    fallbackNotice =
      "If backend TTS is temporarily unreachable, the assistant displays clear text rather than mispronouncing in another language.";
  }

  if (!hasServerStt && !browserSttReliable) {
    const recNote = `Browser speech recognition may not recognize (${language}) on this device without backend Gemini transcription.`;
    limitationNotice = limitationNotice ? `${limitationNotice} ${recNote}` : recNote;
    fallbackNotice =
      fallbackNotice || "Use the accessible text input or Quick Command buttons as an immediate fallback.";
  }

  return {
    language,
    browserVoicesFound: matching.map((v) => `${v.name} (${v.lang})`),
    hasBrowserTts,
    hasBrowserStt: browserSttReliable,
    hasServerTts,
    hasServerStt,
    hasLiveApi: supportsLiveWebSocket,
    synthesisStatus,
    recognitionStatus,
    limitationNotice,
    fallbackNotice,
  };
}

async function speakWithBrowserFallback(
  text: string,
  language: LanguageCode,
  rate = 0.96,
  allowCrossLanguageFallback = false
): Promise<{ spoken: boolean; missingNativeVoice: boolean; voiceName?: string }> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { spoken: false, missingNativeVoice: true };
  }

  const voices = await getLoadedVoices();
  const baseCode = language.toLowerCase();
  const matchingVoice = voices.find((v) => {
    const vl = (v.lang || "").toLowerCase();
    return vl === baseCode || vl.startsWith(`${baseCode}-`) || vl.startsWith(`${baseCode}_`);
  });

  // Strict rule: Never silently switch to another language if requested voice is unavailable
  if (!matchingVoice && !allowCrossLanguageFallback && language !== "en") {
    return { spoken: false, missingNativeVoice: true };
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang;
    } else {
      utterance.lang = LOCALE_MAP[language] || "en-US";
    }
    utterance.rate = Math.max(0.65, Math.min(1.25, rate));
    utterance.onend = () =>
      resolve({
        spoken: true,
        missingNativeVoice: !matchingVoice,
        voiceName: matchingVoice?.name,
      });
    utterance.onerror = () =>
      resolve({ spoken: false, missingNativeVoice: !matchingVoice });
    window.speechSynthesis.speak(utterance);
  });
}

const clientTranslationCache = new Map<string, string>();

export async function translateTextToChosenLanguage(
  text: string,
  language: LanguageCode
): Promise<string> {
  const clean = text.trim();
  if (!clean || language === "en") return clean;

  const key = `${language}::${clean}`;
  const cached = clientTranslationCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(apiUrl("/api/translate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean, language }),
    });
    if (res.ok) {
      const data = (await res.json()) as { translatedText?: string };
      const translated = (data.translatedText || clean).trim();
      clientTranslationCache.set(key, translated);
      return translated;
    }
  } catch {
    // Keep original text on network error
  }
  return clean;
}

export async function speakEthiopianInstruction(
  text: string,
  language: LanguageCode,
  onStatusChange?: (status: {
    playing: boolean;
    provider?: string;
    caption: string;
  }) => void,
  options?: {
    autoTranslate?: boolean;
    textOnly?: boolean;
    rate?: number;
    allowCrossLanguageFallback?: boolean;
  }
): Promise<VoicePlaybackResult> {
  const autoTranslate = options?.autoTranslate !== false;
  const textOnly = Boolean(options?.textOnly);
  const rate = options?.rate ?? 0.96;

  stopAllVoicePlayback();

  const displayText =
    autoTranslate && language !== "en"
      ? await translateTextToChosenLanguage(text, language)
      : text;

  if (textOnly) {
    onStatusChange?.({
      playing: false,
      provider: "ai-chosen-language-reader",
      caption: displayText,
    });
    return { provider: "ai-chosen-language-reader" };
  }

  onStatusChange?.({ playing: true, provider: "connecting", caption: displayText });

  try {
    const response = await fetch(apiUrl("/api/tts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: displayText, language }),
    });

    if (response.ok) {
      const data = (await response.json()) as {
        audioBase64?: string;
        mimeType?: string;
        provider?: string;
        voiceId?: string;
        fallback?: string;
      };

      if (data.audioBase64 && data.mimeType) {
        const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
        audio.playbackRate = Math.max(0.7, Math.min(1.25, rate));
        activeAudio = audio;
        onStatusChange?.({
          playing: true,
          provider: data.provider || "addis-ai",
          caption: displayText,
        });

        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(() => resolve());
        });

        activeAudio = null;
        onStatusChange?.({
          playing: false,
          provider: data.provider || "addis-ai",
          caption: displayText,
        });
        return { provider: data.provider || "addis-ai", voiceId: data.voiceId };
      }
    }
  } catch {
    // Check browser voice availability below without silent wrong-language switch
  }

  onStatusChange?.({
    playing: true,
    provider: "web-speech",
    caption: displayText,
  });

  const browserRes = await speakWithBrowserFallback(
    displayText,
    language,
    rate,
    Boolean(options?.allowCrossLanguageFallback)
  );

  onStatusChange?.({
    playing: false,
    provider: browserRes.spoken ? "web-speech" : "voice-unavailable",
    caption: displayText,
  });

  if (!browserRes.spoken && browserRes.missingNativeVoice) {
    return {
      provider: "voice-unavailable",
      missingNativeVoice: true,
      limitationNotice: `No ${language.toUpperCase()} speech synthesis voice is installed on this browser and cloud TTS is unavailable. Text is shown below without switching to another language.`,
    };
  }

  return {
    provider: "web-speech",
    voiceId: browserRes.voiceName,
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read recorded audio."));
    reader.readAsDataURL(blob);
  });
}

function tryBrowserSpeechRecognition(
  language: LanguageCode,
  maxDurationMs = 6500
): Promise<VoiceListenResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve({ transcript: "", provider: "none", micError: "No browser window." });
      return;
    }
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (!SpeechRec) {
      resolve({
        transcript: "",
        provider: "none",
        micError: "Speech recognition unavailable in this browser.",
      });
      return;
    }

    const recognition = new SpeechRec() as {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      continuous: boolean;
      onresult: (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: (ev: { error?: string }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
      abort: () => void;
    };

    let finished = false;
    let captured = "";
    recognition.lang = LOCALE_MAP[language] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    const timer = window.setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    }, maxDurationMs);

    const finalize = (result: VoiceListenResult) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      activeListeningCleanup = null;
      activeListeningFinish = null;
      resolve(result);
    };

    activeListeningFinish = () => {
      try {
        recognition.stop();
      } catch {
        finalize({ transcript: captured, provider: "web-speech-rec" });
      }
    };

    activeListeningCleanup = () => {
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
      finalize({ transcript: "", provider: "web-speech-rec", cancelled: true });
    };

    recognition.onresult = (event) => {
      const first = event.results?.[0]?.[0]?.transcript || "";
      captured = first.trim();
    };

    recognition.onerror = (ev) => {
      finalize({
        transcript: captured,
        provider: "web-speech-rec",
        micError:
          ev.error === "not-allowed"
            ? "Microphone permission was denied. Allow microphone access or type your response."
            : undefined,
      });
    };

    recognition.onend = () => {
      finalize({ transcript: captured, provider: "web-speech-rec" });
    };

    try {
      recognition.start();
    } catch {
      finalize({
        transcript: "",
        provider: "web-speech-rec",
        micError: "Could not start browser speech recognition.",
      });
    }
  });
}

export async function listenForUserSpeech(options: {
  language: LanguageCode;
  maxDurationMs?: number;
  translateToChosenLanguage?: boolean;
  onStateChange?: (state: "listening" | "transcribing" | "idle") => void;
}): Promise<VoiceListenResult> {
  const {
    language,
    maxDurationMs = 7500,
    translateToChosenLanguage = false,
    onStateChange,
  } = options;
  stopActiveListening();

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === "undefined"
  ) {
    onStateChange?.("listening");
    const recResult = await tryBrowserSpeechRecognition(language, maxDurationMs);
    onStateChange?.("idle");
    return recResult;
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    onStateChange?.("idle");
    const message =
      err instanceof Error && err.name === "NotAllowedError"
        ? "Microphone access was denied. Please allow microphone permission in your browser or use the quick text reply box."
        : "No microphone detected or microphone is busy. You can still type or tap options below.";
    return { transcript: "", provider: "mic", micError: message };
  }

  onStateChange?.("listening");

  const mimeType = MediaRecorder.isTypeSupported("audio/webm")
    ? "audio/webm"
    : MediaRecorder.isTypeSupported("audio/mp4")
    ? "audio/mp4"
    : "";

  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  const chunks: BlobPart[] = [];
  let cancelled = false;
  let stopped = false;

  const stopTracks = () => {
    stream.getTracks().forEach((track) => track.stop());
  };

  // Silence detection via Web Audio AnalyserNode
  let audioCtx: AudioContext | null = null;
  let silenceMonitorId: number | null = null;
  let heardSpeech = false;
  let silenceStart = 0;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const startedAt = Date.now();

      silenceMonitorId = window.setInterval(() => {
        if (stopped) return;
        analyser.getByteTimeDomainData(dataArray);
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = Math.abs(dataArray[i] - 128);
          if (v > peak) peak = v;
        }
        const now = Date.now();
        if (peak > 10) {
          heardSpeech = true;
          silenceStart = 0;
        } else if (heardSpeech && now - startedAt > 1200) {
          if (!silenceStart) {
            silenceStart = now;
          } else if (now - silenceStart > 1400) {
            finishNow();
          }
        }
      }, 150);
    }
  } catch {
    // Ignore AudioContext setup issues; maxDurationMs still stops recording cleanly
  }

  const cleanupAudioResources = () => {
    if (silenceMonitorId !== null) {
      window.clearInterval(silenceMonitorId);
      silenceMonitorId = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    stopTracks();
  };

  const finishNow = () => {
    if (stopped) return;
    stopped = true;
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        cleanupAudioResources();
      }
    }
  };

  const audioBlob = await new Promise<Blob | null>((resolve) => {
    const maxTimer = window.setTimeout(() => {
      finishNow();
    }, maxDurationMs);

    activeListeningFinish = () => {
      window.clearTimeout(maxTimer);
      finishNow();
    };

    activeListeningCleanup = () => {
      cancelled = true;
      window.clearTimeout(maxTimer);
      finishNow();
      resolve(null);
    };

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      window.clearTimeout(maxTimer);
      cleanupAudioResources();
      if (cancelled) {
        resolve(null);
        return;
      }
      resolve(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    };

    recorder.onerror = () => {
      window.clearTimeout(maxTimer);
      cleanupAudioResources();
      resolve(null);
    };

    recorder.start(250);
  });

  activeListeningCleanup = null;
  activeListeningFinish = null;

  if (cancelled) {
    onStateChange?.("idle");
    return { transcript: "", provider: "mic", cancelled: true };
  }

  if (!audioBlob || audioBlob.size < 300) {
    onStateChange?.("idle");
    return { transcript: "", provider: "mic" };
  }

  onStateChange?.("transcribing");
  try {
    const base64 = await blobToBase64(audioBlob);
    const res = await fetch(apiUrl("/api/stt"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: audioBlob.type || "audio/webm",
        language,
        translateToChosenLanguage,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        transcript?: string;
        localizedTranscript?: string;
        unavailable?: boolean;
        provider?: string;
      };
      if (!data.unavailable) {
        onStateChange?.("idle");
        return {
          transcript: (data.transcript || "").trim(),
          localizedTranscript: (data.localizedTranscript || data.transcript || "").trim(),
          provider: data.provider || "gemini-transcribe",
        };
      }
    }
  } catch {
    // Fall back to browser SpeechRecognition if server STT failed
  }

  const fallbackResult = await tryBrowserSpeechRecognition(language, 5000);
  onStateChange?.("idle");
  return fallbackResult;
}

function normalizeSpokenEmail(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+at\s+/g, "@")
    .replace(/\s+dot\s+/g, ".")
    .replace(/\s+/g, "")
    .trim();
}

export function localParseOnboardingField(
  transcript: string,
  fieldContext: {
    fieldId: string;
    label: string;
    options?: string[];
    multi?: boolean;
  }
): OnboardingFieldIntent {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  if (/\b(skip|next|pass|ቀጥል|itti fufi|sii wad|ቀጽል)\b/.test(lower)) {
    return {
      command: "next",
      filledValue: "",
      matchedItems: [],
      confirmationText: `Moving to next question.`,
    };
  }
  if (/\b(back|previous|ተመለስ|duubatti|dib)\b/.test(lower)) {
    return {
      command: "back",
      filledValue: "",
      matchedItems: [],
      confirmationText: `Going back to previous question.`,
    };
  }
  if (/\b(repeat|again|say again|ድገም|irra deebi)\b/.test(lower)) {
    return {
      command: "repeat",
      filledValue: "",
      matchedItems: [],
      confirmationText: `Repeating question.`,
    };
  }
  if (/\b(submit|finish|enter dashboard|done|ግባ)\b/.test(lower)) {
    return {
      command: "submit",
      filledValue: "",
      matchedItems: [],
      confirmationText: `Completing sign-in and opening dashboard.`,
    };
  }

  let value = clean
    .replace(/^(my name is|i am|call me|it is|email is|my goal is|i want to be|target role is)\s+/i, "")
    .trim();

  if (fieldContext.fieldId === "email") {
    value = normalizeSpokenEmail(value);
  }

  if (fieldContext.options && fieldContext.options.length > 0) {
    if (fieldContext.multi) {
      const matched = fieldContext.options.filter((opt) => {
        const words = opt.toLowerCase().split(/[\s/&]+/).filter((w) => w.length > 2);
        return (
          lower.includes(opt.toLowerCase()) ||
          words.some((w) => lower.includes(w))
        );
      });
      return {
        command: "fill",
        filledValue: matched.join(", "),
        matchedItems: matched,
        confirmationText:
          matched.length > 0
            ? `Added skills: ${matched.join(", ")}.`
            : `Keeping current skill selections.`,
      };
    } else {
      const matched =
        fieldContext.options.find((opt) => lower.includes(opt.toLowerCase())) ||
        fieldContext.options.find((opt) =>
          opt
            .toLowerCase()
            .split(/[\s&-]+/)
            .some((w) => w.length > 3 && lower.includes(w))
        ) ||
        fieldContext.options[0];
      return {
        command: "fill",
        filledValue: matched,
        matchedItems: [matched],
        confirmationText: `Selected ${matched}.`,
      };
    }
  }

  return {
    command: "fill",
    filledValue: value,
    matchedItems: [],
    confirmationText: `Filled ${fieldContext.label} with ${value}.`,
  };
}

export async function interpretOnboardingVoiceAnswer(params: {
  transcript: string;
  language: LanguageCode;
  fieldContext: {
    fieldId: string;
    label: string;
    options?: string[];
    multi?: boolean;
  };
}): Promise<OnboardingFieldIntent> {
  const { transcript, language, fieldContext } = params;
  try {
    const res = await fetch(apiUrl("/api/voice-intent"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        language,
        mode: "onboarding_field",
        fieldContext,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<OnboardingFieldIntent> & {
        fallbackToLocal?: boolean;
      };
      if (!data.fallbackToLocal && data.command) {
        return {
          command: data.command,
          filledValue: data.filledValue || "",
          matchedItems: Array.isArray(data.matchedItems) ? data.matchedItems : [],
          confirmationText: data.confirmationText || "",
        };
      }
    }
  } catch {
    // Use local parser below
  }
  return localParseOnboardingField(transcript, fieldContext);
}

export function localParseNavigationCommand(transcript: string): VoiceNavIntent {
  const lower = transcript.toLowerCase().trim();

  if (/\b(stop|pause|quiet|mute|silence|አቁም|dhaabi|jooji)\b/.test(lower)) {
    return {
      action: "stop",
      targetView: "",
      itemNumber: 0,
      queryText: "",
      replyText: "Voice assistant paused. Press Listen or Alt plus V anytime to resume.",
    };
  }

  if (
    /\b(major|options|menu|main options|list options|home options|ዋና አማራጮች|filannoo gurguddoo)\b/.test(
      lower
    )
  ) {
    return {
      action: "read_major_options",
      targetView: "",
      itemNumber: 0,
      queryText: "",
      replyText: "Reading major website options.",
    };
  }

  if (/\b(specific|details|read page|read items|what is here|items|ዝርዝር)\b/.test(lower)) {
    return {
      action: "read_specific",
      targetView: "",
      itemNumber: 0,
      queryText: "",
      replyText: "Reading specific items on this page.",
    };
  }

  if (/\b(check in|checkin|streak|today)\b/.test(lower)) {
    return {
      action: "check_in",
      targetView: "",
      itemNumber: 0,
      queryText: "",
      replyText: "Recording your daily learning check-in.",
    };
  }

  if (/\b(complete|finish lesson|next lesson)\b/.test(lower)) {
    return {
      action: "complete_lesson",
      targetView: "",
      itemNumber: 0,
      queryText: "",
      replyText: "Completing your next active lesson.",
    };
  }

  const numMatch = lower.match(/\b([1-9])\b/);
  const itemNumber = numMatch ? Number(numMatch[1]) : 1;

  if (/\b(enroll|start course|join course)\b/.test(lower)) {
    return {
      action: "enroll_course",
      targetView: "courses",
      itemNumber,
      queryText: "",
      replyText: `Enrolling in recommended course ${itemNumber}.`,
    };
  }

  if (/\b(apply)\b/.test(lower)) {
    return {
      action: "apply_job",
      targetView: "jobs",
      itemNumber,
      queryText: "",
      replyText: `Marking opportunity ${itemNumber} as Applied.`,
    };
  }

  if (/\b(save job|bookmark job|save opportunity)\b/.test(lower)) {
    return {
      action: "save_job",
      targetView: "jobs",
      itemNumber,
      queryText: "",
      replyText: `Saving opportunity ${itemNumber}.`,
    };
  }

  const viewMap: Array<{ view: AppView; pattern: RegExp }> = [
    { view: "vision", pattern: /\b(vision|camera|visual assistant|see|surroundings|ብራእይ|ካሜራ|بصري|كاميرا|caméra|kamera)\b/ },
    { view: "courses", pattern: /\b(course|courses|1|one|first|koorsii|koorsooyin|ኮርስ)\b/ },
    { view: "resources", pattern: /\b(resource|resources|guides|materials|2|two|second|መርጃ)\b/ },
    { view: "progress", pattern: /\b(progress|badge|badges|3|three|third|እድገት)\b/ },
    { view: "jobs", pattern: /\b(job|jobs|career|opportunities|4|four|fourth|ስራ|ሥራ)\b/ },
    { view: "tracker", pattern: /\b(tracker|applications|5|five|fifth|መከታተያ)\b/ },
    { view: "linkedin", pattern: /\b(linkedin|profile|headline|6|six|sixth)\b/ },
    { view: "assistant", pattern: /\b(assistant|ai|chat|help me|7|seven|seventh|ረዳት)\b/ },
    { view: "settings", pattern: /\b(setting|settings|preferences|8|eight|eighth|ቅንብር)\b/ },
    { view: "dashboard", pattern: /\b(dashboard|home|overview|9|nine|ዳሽቦርድ)\b/ },
  ];

  for (const entry of viewMap) {
    if (entry.pattern.test(lower)) {
      return {
        action: "navigate",
        targetView: entry.view,
        itemNumber: 0,
        queryText: "",
        replyText: `Opening ${entry.view}.`,
      };
    }
  }

  return {
    action: "ask_ai",
    targetView: "",
    itemNumber: 0,
    queryText: transcript,
    replyText: "",
  };
}

export async function interpretNavigationVoiceCommand(params: {
  transcript: string;
  language: LanguageCode;
  currentView: AppView;
  contextSummary: string;
}): Promise<VoiceNavIntent> {
  const { transcript, language, currentView, contextSummary } = params;
  try {
    const res = await fetch(apiUrl("/api/voice-intent"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        language,
        mode: "navigation",
        currentView,
        contextSummary,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<VoiceNavIntent> & {
        fallbackToLocal?: boolean;
      };
      if (!data.fallbackToLocal && data.action) {
        return {
          action: data.action,
          targetView: (data.targetView as AppView | "") || "",
          itemNumber: Number(data.itemNumber || 0),
          queryText: data.queryText || "",
          replyText: data.replyText || "",
        };
      }
    }
  } catch {
    // Fallback cleanly below
  }
  return localParseNavigationCommand(transcript);
}

export async function interpretStep2VoiceCommand(
  transcript: string,
  language: LanguageCode
): Promise<"continue" | "repeat" | "stay"> {
  const lower = transcript.toLowerCase();
  if (
    /\b(continue|next|yes|proceed|sign in|step 3|ቀጥል|itti fufi|sii wad|ቀጽል)\b/.test(
      lower
    )
  ) {
    return "continue";
  }
  if (/\b(repeat|again|ድገም)\b/.test(lower)) {
    return "repeat";
  }

  try {
    const res = await fetch(apiUrl("/api/voice-intent"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        language,
        mode: "onboarding_step2",
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as {
        command?: string;
        fallbackToLocal?: boolean;
      };
      if (!data.fallbackToLocal && data.command === "continue") return "continue";
      if (!data.fallbackToLocal && data.command === "repeat") return "repeat";
    }
  } catch {
    // Ignore
  }
  return "stay";
}

export type VisionVoiceCommandType =
  | "describe_front"
  | "read_text"
  | "describe_room"
  | "find_door"
  | "what_color"
  | "repeat"
  | "speak_slower"
  | "speak_faster"
  | "stop_speaking"
  | "change_language"
  | "visual_question";

export interface VisionCommandResult {
  command: VisionVoiceCommandType;
  targetLanguage: LanguageCode | "";
  cleanedQuestion: string;
  spokenAck: string;
}

export function localParseVisionCommand(transcript: string): VisionCommandResult {
  const lower = transcript.toLowerCase().trim();

  if (/\b(stop speaking|stop talking|quiet|silence|mute|stop|توقف|arrête|stopp|simama|አቁም|dhaabi)\b/.test(lower)) {
    return {
      command: "stop_speaking",
      targetLanguage: "",
      cleanedQuestion: "",
      spokenAck: "Stopped speaking.",
    };
  }
  if (/\b(speak slower|slower|slow down|slow|أبطأ|plus lentement|polepole|ቀስ በል)\b/.test(lower)) {
    return {
      command: "speak_slower",
      targetLanguage: "",
      cleanedQuestion: "",
      spokenAck: "Speaking slower now.",
    };
  }
  if (/\b(speak faster|faster|normal speed|أسرع|plus vite|haraka)\b/.test(lower)) {
    return {
      command: "speak_faster",
      targetLanguage: "",
      cleanedQuestion: "",
      spokenAck: "Returned to normal speech speed.",
    };
  }
  if (/\b(repeat|say again|repeat that|أعد|répète|rudia|ድገም|irra deebi)\b/.test(lower)) {
    return {
      command: "repeat",
      targetLanguage: "",
      cleanedQuestion: "",
      spokenAck: "",
    };
  }
  if (/\b(change language|switch language|language|تغيير اللغة|changer de langue|badili lugha|ቋንቋ)\b/.test(lower)) {
    let targetLanguage: LanguageCode | "" = "";
    if (/\b(english|انجليزي|anglais|kiingereza)\b/.test(lower)) targetLanguage = "en";
    else if (/\b(amharic|አማርኛ|أمهرية|amharique)\b/.test(lower)) targetLanguage = "am";
    else if (/\b(oromo|afaan oromo|أورومو)\b/.test(lower)) targetLanguage = "om";
    else if (/\b(arabic|العربية|عربي|arabe)\b/.test(lower)) targetLanguage = "ar";
    else if (/\b(french|français|الفرنسية|kifaransa)\b/.test(lower)) targetLanguage = "fr";
    else if (/\b(swahili|kiswahili|السواحيلية)\b/.test(lower)) targetLanguage = "sw";
    return {
      command: "change_language",
      targetLanguage,
      cleanedQuestion: "",
      spokenAck: targetLanguage
        ? `Changing language to ${targetLanguage}.`
        : "Choose your preferred language from the language selector.",
    };
  }
  if (/\b(read|text|document|sign|ocr|label|اقرأ|نص|lire|texte|soma|maandishi|አንብብ|dubbisi)\b/.test(lower)) {
    return {
      command: "read_text",
      targetLanguage: "",
      cleanedQuestion: transcript,
      spokenAck: "",
    };
  }
  if (/\b(door|exit|stairs|stairway|way out|باب|درج|porte|escalier|mlango|ngazi|በር|balbala)\b/.test(lower)) {
    return {
      command: "find_door",
      targetLanguage: "",
      cleanedQuestion: transcript,
      spokenAck: "",
    };
  }
  if (/\b(color|colour|لون|couleur|rangi|ቀለም|halluu)\b/.test(lower)) {
    return {
      command: "what_color",
      targetLanguage: "",
      cleanedQuestion: transcript,
      spokenAck: "",
    };
  }
  if (/\b(room|around|surroundings|furniture|غرفة|pièce|chambre|chumba|ክፍል|kutaa)\b/.test(lower)) {
    return {
      command: "describe_room",
      targetLanguage: "",
      cleanedQuestion: transcript,
      spokenAck: "",
    };
  }
  if (/\b(in front|ahead|what is this|what do you see|أمامي|devant|mbele|ፊት)\b/.test(lower)) {
    return {
      command: "describe_front",
      targetLanguage: "",
      cleanedQuestion: transcript,
      spokenAck: "",
    };
  }
  return {
    command: "visual_question",
    targetLanguage: "",
    cleanedQuestion: transcript.trim(),
    spokenAck: "",
  };
}

export async function interpretVisionVoiceCommand(
  transcript: string,
  language: LanguageCode
): Promise<VisionCommandResult> {
  const local = localParseVisionCommand(transcript);
  // Fast local match for crisp explicit control commands
  if (
    local.command === "stop_speaking" ||
    local.command === "repeat" ||
    local.command === "speak_slower" ||
    local.command === "speak_faster"
  ) {
    return local;
  }

  try {
    const res = await fetch(apiUrl("/api/vision/command"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, language }),
    });
    if (res.ok) {
      const data = (await res.json()) as Partial<VisionCommandResult> & {
        fallbackToLocal?: boolean;
      };
      if (!data.fallbackToLocal && data.command) {
        return {
          command: data.command,
          targetLanguage: (data.targetLanguage as LanguageCode | "") || "",
          cleanedQuestion: data.cleanedQuestion || transcript,
          spokenAck: data.spokenAck || "",
        };
      }
    }
  } catch {
    // Fall back cleanly to local parser
  }
  return local;
}
