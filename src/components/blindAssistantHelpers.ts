import { LanguageCode } from "../types";
import { LanguageSpeechSupport } from "../services/voiceService";

export function checkLanguageSpeechSupportPlaceholder(
  language: LanguageCode
): LanguageSpeechSupport {
  return {
    language,
    browserVoicesFound: [],
    hasBrowserTts: false,
    hasBrowserStt: false,
    hasServerTts: false,
    hasServerStt: false,
    hasLiveApi: false,
    synthesisStatus: "unavailable",
    recognitionStatus: "unavailable",
    limitationNotice: "Checking browser and backend speech capabilities...",
    fallbackNotice: "Accessible text output is always available.",
  };
}
