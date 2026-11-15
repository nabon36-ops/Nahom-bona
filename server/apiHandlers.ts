import { GoogleGenAI, Type } from "@google/genai";

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  am: "Amharic (አማርኛ)",
  om: "Afaan Oromo",
  ar: "Arabic (العربية)",
  fr: "French (Français)",
  sw: "Swahili (Kiswahili)",
  so: "Somali (Af-Soomaali)",
  ti: "Tigrinya (ትግርኛ)",
};

const ADDIS_VOICES: Record<string, { language: string; voiceId: string }> = {
  am: { language: "am", voiceId: "am-hamen" },
  om: { language: "om", voiceId: "om-bikila" },
  ti: { language: "ti", voiceId: "ti-berhane" },
};

const translationCache = new Map<string, string>();

export function getGeminiClient(apiVersion = "v1beta"): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    apiVersion,
    httpOptions: {
      apiVersion,
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export function getAddisApiKey(): string | undefined {
  return process.env.ADDIS_AI_API_KEY || process.env.ADDIS_API_KEY;
}

export function handleHealth(supportsLiveWebSocket = true) {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasAddisAI = Boolean(getAddisApiKey());
  return {
    status: 200,
    body: {
      ok: true,
      hasGemini,
      hasAddisAI,
      supportsLiveWebSocket: supportsLiveWebSocket && hasGemini,
      models: {
        vision: "gemini-4-hydrogen",
        live: "gemini-3.8-live",
        stt: "gemini-3.5-transcribe",
        tts: "gemini-3.8-flash-lite-tts",
      },
    },
  };
}

export async function handleTts(body: { text?: string; language?: string }) {
  const { text, language = "en" } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return { status: 400, body: { error: "Text is required for speech synthesis." } };
  }

  const cleanText = text.trim().slice(0, 1400);
  const addisConfig = ADDIS_VOICES[language];
  const addisApiKey = getAddisApiKey();
  const ai = getGeminiClient();

  if (addisApiKey && addisConfig) {
    try {
      const addisResponse = await fetch(
        "https://api.addisassistant.com/api/v1/voice/generations",
        {
          method: "POST",
          headers: {
            "x-api-key": addisApiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            voice_id: addisConfig.voiceId,
            language: addisConfig.language,
            output_format: "mp3_44100",
          }),
        }
      );

      if (addisResponse.ok) {
        const contentType = addisResponse.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const payload = (await addisResponse.json()) as {
            audio?: string;
            audio_base64?: string;
            url?: string;
          };
          const base64Data = payload.audio_base64 || payload.audio;
          if (base64Data) {
            return {
              status: 200,
              body: {
                audioBase64: base64Data,
                mimeType: "audio/mpeg",
                provider: "addis-ai",
                voiceId: addisConfig.voiceId,
              },
            };
          }
          if (payload.url) {
            const audioRes = await fetch(payload.url);
            if (audioRes.ok) {
              const buf = Buffer.from(await audioRes.arrayBuffer());
              return {
                status: 200,
                body: {
                  audioBase64: buf.toString("base64"),
                  mimeType: "audio/mpeg",
                  provider: "addis-ai",
                  voiceId: addisConfig.voiceId,
                },
              };
            }
          }
        } else {
          const buf = Buffer.from(await addisResponse.arrayBuffer());
          if (buf.byteLength > 0) {
            return {
              status: 200,
              body: {
                audioBase64: buf.toString("base64"),
                mimeType: contentType.includes("wav") ? "audio/wav" : "audio/mpeg",
                provider: "addis-ai",
                voiceId: addisConfig.voiceId,
              },
            };
          }
        }
      }
    } catch (err) {
      console.warn("Addis AI TTS fallback triggered:", err);
    }
  }

  if (ai) {
    try {
      const langLabel = LANGUAGE_NAMES[language] || "English";
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Speak clearly, naturally, and calmly in ${langLabel}: ${cleanText}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(
        (p) => Boolean(p.inlineData?.data)
      );
      const base64Audio = audioPart?.inlineData?.data;
      if (base64Audio) {
        return {
          status: 200,
          body: {
            audioBase64: base64Audio,
            mimeType: audioPart?.inlineData?.mimeType || "audio/wav",
            provider: addisConfig ? "addis-ai-compatible-gemini" : "gemini-tts",
            voiceId: addisConfig?.voiceId || "Kore",
          },
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Gemini TTS error, returning browser-speech indicator:", msg);
      return {
        status: 200,
        body: {
          fallback: "browser-speech",
          provider: "web-speech",
          serverTtsAvailable: false,
          language,
          text: cleanText,
          ttsDetail: msg,
        },
      };
    }
  }

  return {
    status: 200,
    body: {
      fallback: "browser-speech",
      provider: "web-speech",
      serverTtsAvailable: false,
      language,
      text: cleanText,
    },
  };
}

export async function handleVisionDescribe(body: {
  imageBase64?: string;
  mimeType?: string;
  language?: string;
  question?: string;
  mode?:
    | "front"
    | "read_text"
    | "room"
    | "find_door"
    | "color"
    | "continuous"
    | "question";
  history?: Array<{ role: string; text: string }>;
}) {
  const {
    imageBase64,
    mimeType = "image/jpeg",
    language = "en",
    question = "",
    mode = "front",
    history = [],
  } = body;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return { status: 400, body: { error: "Camera image frame is required." } };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 503,
      body: {
        error:
          "GEMINI_API_KEY is not configured on the backend server. Real vision analysis requires a valid Gemini API key.",
        missingApiKey: true,
      },
    };
  }

  const targetLang = LANGUAGE_NAMES[language] || "English";
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const modeDirectives: Record<string, string> = {
    front:
      "Describe what is directly in front of the user: objects, furniture, people, distances/positions (left, center, right, near, far), doors, stairs, or obstacles.",
    read_text:
      "Perform accurate OCR on any printed text, signs, labels, screens, or documents in view. Read the visible text clearly and concisely.",
    room:
      "Describe the room or environment concisely: type of space, key furniture or household objects, layout, lighting, colors, and doors or stairs.",
    find_door:
      "Look specifically for any door, doorway, exit, hallway, gate, or stairs. State its approximate direction (left, straight ahead, right) and whether anything is in the way, or state clearly if no door is visible.",
    color:
      "Identify the main colors and visual appearance/patterns of the primary object(s) in front of the camera.",
    continuous:
      "Give a very brief 1-2 sentence ambient update of the main visible items and highlight any immediate obstacle, stairs, or hazard.",
    question: question.trim()
      ? `Answer the user's specific visual question concisely and accurately: "${question.trim()}".`
      : "Describe what is currently visible in the camera frame.",
  };

  const recentContext = history
    .slice(-4)
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`)
    .join("\n");

  const prompt = [
    `You are an AI Visual Assistant helping a blind or visually impaired person understand their surroundings from a live rear-camera photo.`,
    `CRITICAL LANGUAGE RULE: Write ALL output strings ("description", "hazardWarning", "detectedFeatures") strictly in ${targetLang} (except "ocrText" which preserves the original printed characters alongside translation in "description" if helpful).`,
    `Task: ${modeDirectives[mode] || modeDirectives.front}`,
    recentContext ? `Recent conversation context:\n${recentContext}` : "",
    `Strict Style & Safety Rules:`,
    `1. Keep "description" short, practical, and easy to hear (1-3 crisp sentences, unless reading a longer printed document).`,
    `2. Mention spatial clock/direction cues when useful (e.g., to your left, directly ahead, on the right).`,
    `3. Recognize people, furniture, household objects, doors, stairs, walls, signs, printed text, and colors when clearly visible.`,
    `4. If any stairs, drop-off, low obstacle, moving vehicle, sharp object, hot surface, or blocking item is visible, populate "hazardWarning" with a clear warning in ${targetLang}; otherwise set "hazardWarning" to "".`,
    `5. NEVER claim a path is guaranteed safe or completely clear. Only state what is visually observed and remind caution if a hazard appears.`,
    `6. If an area is blurry, dark, or obscured, say so honestly instead of guessing.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType.split(";")[0].trim() || "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            hazardWarning: { type: Type.STRING },
            ocrText: { type: Type.STRING },
            colorsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            detectedFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "description",
            "hazardWarning",
            "ocrText",
            "colorsDetected",
            "detectedFeatures",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}") as {
      description?: string;
      hazardWarning?: string;
      ocrText?: string;
      colorsDetected?: string[];
      detectedFeatures?: string[];
    };

    return {
      status: 200,
      body: {
        description: (parsed.description || "").trim(),
        hazardWarning: (parsed.hazardWarning || "").trim(),
        ocrText: (parsed.ocrText || "").trim(),
        colorsDetected: Array.isArray(parsed.colorsDetected)
          ? parsed.colorsDetected
          : [],
        detectedFeatures: Array.isArray(parsed.detectedFeatures)
          ? parsed.detectedFeatures
          : [],
        language,
        provider: "gemini-vision",
      },
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Vision describe error:", detail);
    return {
      status: 500,
      body: {
        error: "Gemini Vision could not analyze this camera frame. Check connection or retry.",
        detail,
      },
    };
  }
}

export async function handleVisionCommand(body: {
  transcript?: string;
  language?: string;
}) {
  const { transcript, language = "en" } = body;
  if (!transcript || !transcript.trim()) {
    return { status: 400, body: { error: "Transcript is required." } };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return { status: 200, body: { fallbackToLocal: true } };
  }

  const targetLang = LANGUAGE_NAMES[language] || "English";

  try {
    const prompt = `Classify a blind/visually impaired user's spoken request in ${targetLang} (or mixed terms).
User said: "${transcript.trim()}"

Map to one exact command:
- "describe_front": asking what is in front of them
- "read_text": asking to read printed text, label, sign, or document
- "describe_room": asking to describe the room or overall surroundings
- "find_door": asking to find a door, exit, stairs, or hallway
- "what_color": asking the color of an object
- "repeat": asking to repeat the previous answer
- "speak_slower": asking the assistant to speak slower
- "speak_faster": asking to speak faster or normal speed
- "stop_speaking": asking to stop speaking, be quiet, pause, or shut up
- "change_language": asking to change language (if a target language is named—English=en, Amharic=am, Afaan Oromo=om, Arabic=ar, French=fr, Swahili=sw, Somali=so, Tigrinya=ti—put its code in targetLanguage, else "")
- "visual_question": any other specific question about what the camera sees

Return JSON with command, targetLanguage, cleanedQuestion, and a brief natural confirmation spokenAck in ${targetLang}.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            command: { type: Type.STRING },
            targetLanguage: { type: Type.STRING },
            cleanedQuestion: { type: Type.STRING },
            spokenAck: { type: Type.STRING },
          },
          required: ["command", "targetLanguage", "cleanedQuestion", "spokenAck"],
        },
      },
    });

    const raw = (response.text || "{}").replace(/^```json\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(raw);
    return { status: 200, body: { ...parsed, provider: "gemini" } };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn("Vision command classification fallback:", detail);
    return { status: 200, body: { fallbackToLocal: true, detail } };
  }
}

export async function handleAssistant(body: {
  message?: string;
  language?: string;
  disabilityProfiles?: string[];
  careerPlan?: {
    targetTrack?: string;
    targetRole?: string;
    experienceLevel?: string;
    workStyle?: string;
    skills?: string[];
    goalStatement?: string;
  };
  courses?: Array<{ id: string; title: string; field: string; skills: string[] }>;
  jobs?: Array<{ id: string; title: string; company: string; track: string }>;
  history?: Array<{ role: string; text: string }>;
}) {
  const {
    message,
    language = "en",
    disabilityProfiles = [],
    careerPlan = {},
    courses = [],
    jobs = [],
    history = [],
  } = body;

  if (!message || !message.trim()) {
    return { status: 400, body: { error: "Message is required." } };
  }

  const ai = getGeminiClient();
  const targetLang = LANGUAGE_NAMES[language] || "English";

  if (!ai) {
    return {
      status: 503,
      body: {
        error: "GEMINI_API_KEY is not configured on the server.",
        missingApiKey: true,
      },
    };
  }

  try {
    const systemInstruction = [
      `You are the AccessPath AI Career & Accessibility Assistant.`,
      `Always respond exclusively in ${targetLang}.`,
      `User Accessibility Profiles: ${disabilityProfiles.join(", ") || "standard"}.`,
      `User Career Plan: Target Track="${careerPlan.targetTrack || "Software & Web"}", Target Role="${careerPlan.targetRole || "Developer"}", Level="${careerPlan.experienceLevel || "Beginner"}", Work Style="${careerPlan.workStyle || "Remote"}", Target Skills=[${(careerPlan.skills || []).join(", ")}], Goal="${careerPlan.goalStatement || ""}".`,
      `Available Savannah Demonstration Courses: ${courses.map((c) => `${c.id}: ${c.title} (${c.field})`).join("; ")}.`,
      `Available Example Career Opportunities: ${jobs.map((j) => `${j.id}: ${j.title} at ${j.company}`).join("; ")}.`,
      `Keep advice concise, actionable, respectful, and directly tied to their career plan and skill gaps.`,
    ].join("\n");

    const conversationContext = history
      .slice(-6)
      .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.text}`)
      .join("\n");

    const prompt = conversationContext
      ? `${conversationContext}\nUser: ${message}`
      : message;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: { systemInstruction },
    });

    return {
      status: 200,
      body: {
        reply:
          response.text ||
          "I am ready to help with your learning plan, skill gaps, and career search.",
        provider: "gemini",
      },
    };
  } catch (err) {
    console.error("Assistant API error:", err);
    return {
      status: 500,
      body: { error: "Unable to reach AI Career Assistant right now." },
    };
  }
}

export async function handleSignDetect(body: {
  imageBase64?: string;
  mimeType?: string;
  language?: string;
}) {
  const { imageBase64, mimeType = "image/jpeg", language = "en" } = body;
  if (!imageBase64) {
    return { status: 400, body: { error: "Camera image frame is required." } };
  }

  const ai = getGeminiClient();
  const targetLang = LANGUAGE_NAMES[language] || "English";
  if (!ai) {
    return {
      status: 503,
      body: {
        error: "GEMINI_API_KEY is not configured on the server for sign gesture recognition.",
        missingApiKey: true,
      },
    };
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          {
            text: `Inspect the user's hand sign or gesture in this webcam frame for an accessible learning & career platform. Map clear hand gestures to one of these supported user commands:
- open_palm / wave / greeting -> navigate to "dashboard"
- thumbs_up / ok_sign / check -> "complete_lesson"
- pointing_up / one_finger / book_sign -> navigate to "courses"
- two_fingers / peace / v_sign -> navigate to "jobs"
- three_fingers -> navigate to "tracker"
- four_fingers -> navigate to "progress"
- five_fingers_spread -> navigate to "linkedin"
- fist / help_sign / phone_hand -> navigate to "assistant"
- pinch / gear_gesture -> navigate to "settings"
- no clear hand or unclear -> "none"

Respond in JSON with a friendly short message in ${targetLang} explaining what task is being executed.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSign: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            actionType: { type: Type.STRING },
            actionTarget: { type: Type.STRING },
            replyInLanguage: { type: Type.STRING },
          },
          required: [
            "detectedSign",
            "confidence",
            "actionType",
            "actionTarget",
            "replyInLanguage",
          ],
        },
      },
    });
    const parsed = JSON.parse(response.text || "{}");
    return { status: 200, body: { ...parsed, provider: "gemini-vision" } };
  } catch (err) {
    console.error("Sign detection error:", err);
    return { status: 500, body: { error: "Sign detection failed." } };
  }
}

export async function handleLinkedInDraft(body: {
  draftType?: "headline" | "bio" | "post";
  language?: string;
  userName?: string;
  careerPlan?: { targetRole?: string; targetTrack?: string; goalStatement?: string };
  completedCourseTitles?: string[];
  skills?: string[];
}) {
  const {
    draftType = "headline",
    language = "en",
    userName = "Learner",
    careerPlan = {},
    completedCourseTitles = [],
    skills = [],
  } = body;

  const ai = getGeminiClient();
  const targetLang = LANGUAGE_NAMES[language] || "English";

  if (!ai) {
    return {
      status: 503,
      body: { error: "GEMINI_API_KEY is not configured on the server." },
    };
  }

  try {
    const prompt = `Draft a professional LinkedIn ${draftType} in ${targetLang} for ${userName}.
Target Role: ${careerPlan.targetRole || "Software & Accessibility Specialist"}
Career Track: ${careerPlan.targetTrack || "Technology"}
Goal: ${careerPlan.goalStatement || "Build accessible products and grow professionally"}
Completed Courses: ${completedCourseTitles.join(", ") || "In-progress learning"}
Skills: ${skills.join(", ") || "Problem solving, technical communication"}
Keep it authentic, crisp, and ready to copy-paste.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
    });

    return {
      status: 200,
      body: { content: response.text?.trim() || "", provider: "gemini" },
    };
  } catch (err) {
    console.error("LinkedIn draft error:", err);
    return { status: 500, body: { error: "Could not generate LinkedIn draft." } };
  }
}

export async function handleStt(body: {
  audioBase64?: string;
  mimeType?: string;
  language?: string;
  translateToChosenLanguage?: boolean;
}) {
  const {
    audioBase64,
    mimeType = "audio/webm",
    language = "en",
    translateToChosenLanguage = false,
  } = body;

  if (!audioBase64 || typeof audioBase64 !== "string") {
    return { status: 400, body: { error: "Audio recording is required." } };
  }

  const ai = getGeminiClient();
  if (!ai) {
    return {
      status: 200,
      body: {
        transcript: "",
        localizedTranscript: "",
        unavailable: true,
        provider: "browser-speech-only",
      },
    };
  }

  try {
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
    const cleanMime = mimeType.split(";")[0].trim() || "audio/webm";
    const targetLang = LANGUAGE_NAMES[language] || "English";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: [
        {
          text: `Transcribe the user's spoken words accurately. The user's selected language is ${targetLang}, though they may speak English terms or technical words. Return ONLY the exact transcribed text with no extra commentary, quotes, or timestamps. If no clear speech is audible, return an empty string.`,
        },
        {
          inlineData: {
            mimeType: cleanMime,
            data: cleanBase64,
          },
        },
      ],
    });

    const transcript = (response.text || "").trim();
    let localizedTranscript = transcript;

    if (translateToChosenLanguage && transcript) {
      try {
        const transRes = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: `Translate or normalize this spoken transcript into clear, natural ${targetLang}. If it is already in ${targetLang}, return it cleanly in ${targetLang}. Return ONLY the translated text.\n\nTranscript: ${transcript}`,
        });
        localizedTranscript = (transRes.text || transcript).trim();
      } catch {
        localizedTranscript = transcript;
      }
    }

    return {
      status: 200,
      body: {
        transcript,
        localizedTranscript,
        language,
        provider: "gemini-transcribe",
      },
    };
  } catch (err) {
    console.error("STT API error:", err);
    return { status: 500, body: { error: "Speech transcription failed." } };
  }
}

export async function handleTranslate(body: { text?: string; language?: string }) {
  const { text, language = "en" } = body;
  if (!text || typeof text !== "string" || !text.trim()) {
    return { status: 400, body: { error: "Text is required." } };
  }

  const clean = text.trim();
  const ai = getGeminiClient();
  if (language === "en" || !ai) {
    return {
      status: 200,
      body: { translatedText: clean, provider: ai ? "passthrough" : "unavailable" },
    };
  }

  const cacheKey = `${language}::${clean}`;
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return { status: 200, body: { translatedText: cached, provider: "gemini-cache" } };
  }

  try {
    const targetLang = LANGUAGE_NAMES[language] || "English";
    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Translate the following accessibility/education text naturally and accurately into ${targetLang}. Keep technical terms clear, and return ONLY the translated text without quotes or explanations.\n\nText: ${clean}`,
    });
    const translatedText = (response.text || clean).trim();
    translationCache.set(cacheKey, translatedText);
    return { status: 200, body: { translatedText, provider: "gemini" } };
  } catch (err) {
    console.warn("Translation fallback:", err);
    return { status: 200, body: { translatedText: clean, provider: "fallback" } };
  }
}

export async function handleAiCommunicate(body: {
  language?: string;
  view?: string;
  isDeaf?: boolean;
  isBlind?: boolean;
  userName?: string;
  careerPlan?: { targetRole?: string; targetTrack?: string; skills?: string[] };
  pageSummary?: string;
  userMessage?: string;
}) {
  const {
    language = "en",
    view = "dashboard",
    isDeaf = false,
    isBlind = false,
    userName = "Learner",
    careerPlan = {},
    pageSummary = "",
    userMessage = "",
  } = body;

  const ai = getGeminiClient();
  const targetLang = LANGUAGE_NAMES[language] || "English";

  if (!ai) {
    return {
      status: 503,
      body: { error: "GEMINI_API_KEY is not configured on the server." },
    };
  }

  try {
    const systemInstruction = [
      `You are the AccessPath Multilingual AI Communicator & Accessible Page Reader.`,
      `CRITICAL: Respond 100% exclusively in ${targetLang}.`,
      `User profile: Name="${userName}", Deaf/Hard-of-Hearing=${isDeaf}, Blind/Low-Vision=${isBlind}, Target Role="${careerPlan.targetRole || "Tech Specialist"}", Track="${careerPlan.targetTrack || "Software"}".`,
      isDeaf
        ? `Because the user is Deaf or Hard of Hearing, present clear, scannable written sentences in ${targetLang} that directly read and explain what is on the screen.`
        : `Present clear, supportive communication in ${targetLang}.`,
      `Current view: "${view}". Page content summary: ${pageSummary}`,
    ].join("\n");

    const prompt = userMessage.trim()
      ? `User says: "${userMessage.trim()}". Reply helpfully in ${targetLang} based on their current page (${view}) and Career Plan.`
      : `Read and summarize the visible texts and main actions of the "${view}" page clearly in ${targetLang} for ${userName}, and invite them to reply or ask anything.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: { systemInstruction },
    });

    return {
      status: 200,
      body: { reply: (response.text || "").trim(), provider: "gemini" },
    };
  } catch (err) {
    console.error("AI communicate error:", err);
    return { status: 500, body: { error: "AI communication failed." } };
  }
}

export async function handleVoiceIntent(body: {
  transcript?: string;
  language?: string;
  mode?: "onboarding_field" | "navigation" | "onboarding_step2";
  fieldContext?: {
    fieldId: string;
    label: string;
    options?: string[];
    multi?: boolean;
  };
  currentView?: string;
  contextSummary?: string;
}) {
  const {
    transcript,
    language = "en",
    mode = "navigation",
    fieldContext,
    currentView = "dashboard",
    contextSummary = "",
  } = body;

  if (!transcript || !transcript.trim()) {
    return { status: 400, body: { error: "Transcript is required." } };
  }

  const ai = getGeminiClient();
  const targetLang = LANGUAGE_NAMES[language] || "English";
  if (!ai) {
    return {
      status: 200,
      body: { fallbackToLocal: true, provider: "local-parser" },
    };
  }

  try {
    if (mode === "onboarding_field" && fieldContext) {
      const optionsNote = fieldContext.options?.length
        ? `Allowed options: ${fieldContext.options.join(", ")}.`
        : "Free text field.";

      const prompt = `You are helping a blind or visually impaired user fill a form field by voice in ${targetLang}.
Field ID: "${fieldContext.fieldId}"
Field Label: "${fieldContext.label}"
Multi-select: ${Boolean(fieldContext.multi)}
${optionsNote}
User spoken transcript: "${transcript}"

Return JSON with command ("fill" | "next" | "back" | "repeat" | "submit"), filledValue, matchedItems, and confirmationText in ${targetLang}.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              command: { type: Type.STRING },
              filledValue: { type: Type.STRING },
              matchedItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              confirmationText: { type: Type.STRING },
            },
            required: ["command", "filledValue", "matchedItems", "confirmationText"],
          },
        },
      });
      return {
        status: 200,
        body: { ...JSON.parse(response.text || "{}"), provider: "gemini" },
      };
    }

    if (mode === "onboarding_step2") {
      const prompt = `A blind user just selected accessibility options on step 2 in ${targetLang}.
User transcript: "${transcript}"
Did they say to continue ("continue"), repeat ("repeat"), or stay ("stay")?
Return JSON with command and confirmationText in ${targetLang}.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              command: { type: Type.STRING },
              confirmationText: { type: Type.STRING },
            },
            required: ["command", "confirmationText"],
          },
        },
      });
      return {
        status: 200,
        body: { ...JSON.parse(response.text || "{}"), provider: "gemini" },
      };
    }

    const navPrompt = `You are the AccessPath voice navigation assistant speaking ${targetLang}.
Current page view: "${currentView}".
Visible items summary: ${contextSummary}
User spoken command: "${transcript}"

Map the user's request to one action:
- "navigate": open one of: "dashboard", "vision", "courses", "resources", "progress", "jobs", "tracker", "linkedin", "assistant", "settings"
- "read_major_options", "read_specific", "enroll_course", "complete_lesson", "save_job", "apply_job", "check_in", "ask_ai", "stop", "unknown"

Respond in JSON with action, targetView, itemNumber, queryText, and replyText in ${targetLang}.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: navPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            targetView: { type: Type.STRING },
            itemNumber: { type: Type.INTEGER },
            queryText: { type: Type.STRING },
            replyText: { type: Type.STRING },
          },
          required: ["action", "targetView", "itemNumber", "queryText", "replyText"],
        },
      },
    });
    return {
      status: 200,
      body: { ...JSON.parse(response.text || "{}"), provider: "gemini" },
    };
  } catch (err) {
    console.error("Voice intent error:", err);
    return { status: 200, body: { fallbackToLocal: true, provider: "local-parser" } };
  }
}
