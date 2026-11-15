import { LanguageCode } from "../types";

export interface VoicePlaybackResult {
  provider: string;
  voiceId?: string;
}

let activeAudio: HTMLAudioElement | null = null;

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

function speakWithBrowserFallback(text: string, language: LanguageCode): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<LanguageCode, string> = {
      en: "en-US",
      am: "am-ET",
      om: "om-ET",
      so: "so-SO",
      ti: "ti-ET",
    };
    utterance.lang = langMap[language] || "en-US";
    utterance.rate = 0.96;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speakEthiopianInstruction(
  text: string,
  language: LanguageCode,
  onStatusChange?: (status: {
    playing: boolean;
    provider?: string;
    caption: string;
  }) => void
): Promise<VoicePlaybackResult> {
  stopAllVoicePlayback();
  onStatusChange?.({ playing: true, provider: "connecting", caption: text });

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
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
        activeAudio = audio;
        onStatusChange?.({
          playing: true,
          provider: data.provider || "addis-ai",
          caption: text,
        });

        await new Promise<void>((resolve) => {
          audio.onended = () => resolve();
          audio.onerror = () => resolve();
          audio.play().catch(async () => {
            await speakWithBrowserFallback(text, language);
            resolve();
          });
        });

        activeAudio = null;
        onStatusChange?.({
          playing: false,
          provider: data.provider || "addis-ai",
          caption: text,
        });
        return { provider: data.provider || "addis-ai", voiceId: data.voiceId };
      }
    }
  } catch {
    // Fallback cleanly to browser speech synthesis below
  }

  onStatusChange?.({
    playing: true,
    provider: "web-speech",
    caption: text,
  });
  await speakWithBrowserFallback(text, language);
  onStatusChange?.({
    playing: false,
    provider: "web-speech",
    caption: text,
  });

  return { provider: "web-speech" };
}
