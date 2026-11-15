import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const geminiApiKey = process.env.GEMINI_API_KEY;
const addisApiKey = process.env.ADDIS_AI_API_KEY || process.env.ADDIS_API_KEY;

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  am: "Amharic (አማርኛ)",
  om: "Afaan Oromo",
  so: "Somali (Af-Soomaali)",
  ti: "Tigrinya (ትግርኛ)",
};

const ADDIS_VOICES: Record<string, { language: string; voiceId: string }> = {
  am: { language: "am", voiceId: "am-hamen" },
  om: { language: "om", voiceId: "om-bikila" },
  ti: { language: "ti", voiceId: "ti-berhane" },
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      hasGemini: Boolean(ai),
      hasAddisAI: Boolean(addisApiKey),
    });
  });

  // Ethiopian & Multilingual TTS Proxy (Addis AI primary for Amharic/Oromo/Tigrinya, Gemini TTS fallback)
  app.post("/api/tts", async (req, res) => {
    const { text, language = "en" } = req.body as {
      text?: string;
      language?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required for speech synthesis." });
      return;
    }

    const cleanText = text.trim().slice(0, 1200);
    const addisConfig = ADDIS_VOICES[language];

    // 1. Try Addis AI first for Ethiopian languages when ADDIS_AI_API_KEY is configured
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
              res.json({
                audioBase64: base64Data,
                mimeType: "audio/mpeg",
                provider: "addis-ai",
                voiceId: addisConfig.voiceId,
              });
              return;
            }
            if (payload.url) {
              const audioRes = await fetch(payload.url);
              if (audioRes.ok) {
                const buf = Buffer.from(await audioRes.arrayBuffer());
                res.json({
                  audioBase64: buf.toString("base64"),
                  mimeType: "audio/mpeg",
                  provider: "addis-ai",
                  voiceId: addisConfig.voiceId,
                });
                return;
              }
            }
          } else {
            const buf = Buffer.from(await addisResponse.arrayBuffer());
            if (buf.byteLength > 0) {
              res.json({
                audioBase64: buf.toString("base64"),
                mimeType: contentType.includes("wav") ? "audio/wav" : "audio/mpeg",
                provider: "addis-ai",
                voiceId: addisConfig.voiceId,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Addis AI TTS fallback triggered:", err);
      }
    }

    // 2. Try Gemini TTS for Ethiopian languages & English when Gemini API is configured
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
                  text: `Speak clearly and warmly in ${langLabel} as an accessible Ethiopian learning & career guide: ${cleanText}`,
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

        const base64Audio =
          ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          res.json({
            audioBase64: base64Audio,
            mimeType: "audio/wav",
            provider: addisConfig ? "addis-ai-compatible-gemini" : "gemini-tts",
            voiceId: addisConfig?.voiceId || "Kore",
          });
          return;
        }
      } catch (err) {
        console.warn("Gemini TTS error, falling back to browser speech:", err);
      }
    }

    // 3. Clean browser Web Speech API fallback so voice instruction always works
    res.json({
      fallback: "browser-speech",
      provider: "web-speech",
      language,
      text: cleanText,
    });
  });

  // AI Career Assistant Endpoint
  app.post("/api/assistant", async (req, res) => {
    const {
      message,
      language = "en",
      disabilityProfiles = [],
      careerPlan = {},
      courses = [],
      jobs = [],
      history = [],
    } = req.body as {
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
    };

    if (!message || !message.trim()) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const targetLang = LANGUAGE_NAMES[language] || "English";

    if (!ai) {
      res.json({
        reply: `[Demonstration Mode] Based on your career plan (${careerPlan.targetRole || "Tech Professional"}), focus on closing skill gaps in ${(careerPlan.skills || ["Accessibility", "TypeScript"]).slice(0, 3).join(", ")}. I recommend starting your top matched Savannah course and reviewing matching remote-friendly roles.`,
        provider: "demo",
      });
      return;
    }

    try {
      const systemInstruction = [
        `You are the AccessPath AI Career & Accessibility Assistant.`,
        `Always respond exclusively in ${targetLang}.`,
        `User Accessibility Profiles: ${disabilityProfiles.join(", ") || "standard"}.`,
        `User Career Plan: Target Track="${careerPlan.targetTrack || "Software & Web"}", Target Role="${careerPlan.targetRole || "Developer"}", Level="${careerPlan.experienceLevel || "Beginner"}", Work Style="${careerPlan.workStyle || "Remote"}", Target Skills=[${(careerPlan.skills || []).join(", ")}], Goal="${careerPlan.goalStatement || ""}".`,
        `Available Savannah Demonstration Courses: ${courses.map((c) => `${c.id}: ${c.title} (${c.field})`).join("; ")}.`,
        `Available Example Career Opportunities: ${jobs.map((j) => `${j.id}: ${j.title} at ${j.company}`).join("; ")}.`,
        `Keep advice concise, actionable, respectful, and directly tied to their career plan and skill gaps. Do not invent fake live integrations.`,
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
        config: {
          systemInstruction,
        },
      });

      res.json({
        reply:
          response.text ||
          "I am ready to help with your learning plan, skill gaps, and career search.",
        provider: "gemini",
      });
    } catch (err) {
      console.error("Assistant API error:", err);
      res.status(500).json({
        error: "Unable to reach AI Career Assistant right now.",
      });
    }
  });

  // Sign Language Camera Gesture / Response Detection & Task Execution
  app.post("/api/sign-detect", async (req, res) => {
    const { imageBase64, mimeType = "image/jpeg", language = "en" } = req.body as {
      imageBase64?: string;
      mimeType?: string;
      language?: string;
    };

    if (!imageBase64) {
      res.status(400).json({ error: "Camera image frame is required." });
      return;
    }

    const targetLang = LANGUAGE_NAMES[language] || "English";

    if (!ai) {
      res.json({
        detectedSign: "Open Palm / Courses",
        confidence: 0.78,
        actionType: "navigate",
        actionTarget: "courses",
        replyInLanguage:
          "Sign gesture detected in demonstration mode. Opening recommended Savannah courses.",
        provider: "demo",
      });
      return;
    }

    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Inspect the user's hand sign or gesture in this webcam frame for an accessible learning & career platform. Map clear hand gestures to one of these supported user commands:
- open_palm / wave / greeting -> navigate to "dashboard"
- thumbs_up / ok_sign / check -> "complete_lesson" (complete next step or confirm)
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
              actionType: {
                type: Type.STRING,
                description: "One of: navigate, complete_lesson, read_aloud, none",
              },
              actionTarget: {
                type: Type.STRING,
                description:
                  "Target view: dashboard, courses, jobs, tracker, progress, linkedin, assistant, settings, or empty string",
              },
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
      res.json({ ...parsed, provider: "gemini-vision" });
    } catch (err) {
      console.error("Sign detection error:", err);
      res.status(500).json({ error: "Sign detection failed." });
    }
  });

  // LinkedIn Content Drafting Endpoint
  app.post("/api/linkedin-draft", async (req, res) => {
    const {
      draftType = "headline",
      language = "en",
      userName = "Learner",
      careerPlan = {},
      completedCourseTitles = [],
      skills = [],
    } = req.body as {
      draftType?: "headline" | "bio" | "post";
      language?: string;
      userName?: string;
      careerPlan?: { targetRole?: string; targetTrack?: string; goalStatement?: string };
      completedCourseTitles?: string[];
      skills?: string[];
    };

    const targetLang = LANGUAGE_NAMES[language] || "English";

    if (!ai) {
      const fallbacks: Record<string, string> = {
        headline: `${careerPlan.targetRole || "Accessible Tech Specialist"} | ${skills.slice(0, 3).join(" · ")} | Continuous Learner on AccessPath`,
        bio: `I am ${userName}, focused on ${careerPlan.targetRole || "inclusive digital product development"}. Through structured learning in ${completedCourseTitles.join(", ") || careerPlan.targetTrack || "technology"}, I am building practical skills in ${skills.join(", ") || "accessible systems"}.`,
        post: `Proud to share a new learning milestone on my career path toward ${careerPlan.targetRole || "my target role"}. Recently completed: ${completedCourseTitles[0] || "Accessible Web Foundations"}. Always learning and open to inclusive opportunities.`,
      };
      res.json({ content: fallbacks[draftType] || fallbacks.headline, provider: "demo" });
      return;
    }

    try {
      const prompt = `Draft a professional LinkedIn ${draftType} in ${targetLang} for ${userName}.
Target Role: ${careerPlan.targetRole || "Software & Accessibility Specialist"}
Career Track: ${careerPlan.targetTrack || "Technology"}
Goal: ${careerPlan.goalStatement || "Build accessible products and grow professionally"}
Completed Courses: ${completedCourseTitles.join(", ") || "In-progress learning"}
Skills: ${skills.join(", ") || "Problem solving, technical communication"}
Keep it authentic, crisp, and ready to copy-paste. Do not claim automated LinkedIn publishing.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
      });

      res.json({
        content: response.text?.trim() || "",
        provider: "gemini",
      });
    } catch (err) {
      console.error("LinkedIn draft error:", err);
      res.status(500).json({ error: "Could not generate LinkedIn draft." });
    }
  });

  const translationCache = new Map<string, string>();

  // Multilingual Speech-to-Text Endpoint (Gemini Audio Transcription)
  app.post("/api/stt", async (req, res) => {
    const {
      audioBase64,
      mimeType = "audio/webm",
      language = "en",
      translateToChosenLanguage = false,
    } = req.body as {
      audioBase64?: string;
      mimeType?: string;
      language?: string;
      translateToChosenLanguage?: boolean;
    };

    if (!audioBase64 || typeof audioBase64 !== "string") {
      res.status(400).json({ error: "Audio recording is required." });
      return;
    }

    if (!ai) {
      res.json({
        transcript: "",
        localizedTranscript: "",
        unavailable: true,
        provider: "browser-speech-only",
      });
      return;
    }

    try {
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
      const cleanMime = mimeType.split(";")[0].trim() || "audio/webm";
      const targetLang = LANGUAGE_NAMES[language] || "English";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: [
          {
            text: `Transcribe the user's spoken words accurately. The user's selected platform language is ${targetLang}, though they may speak English terms (like email addresses, React, TypeScript, Courses, Jobs, Dashboard). Return ONLY the exact transcribed text with no extra commentary, quotes, or timestamps. If no clear speech is audible, return an empty string.`,
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

      res.json({
        transcript,
        localizedTranscript,
        language,
        provider: "gemini-transcribe",
      });
    } catch (err) {
      console.error("STT API error:", err);
      res.status(500).json({ error: "Speech transcription failed." });
    }
  });

  // AI Translation Endpoint for chosen-language reading & captions
  app.post("/api/translate", async (req, res) => {
    const { text, language = "en" } = req.body as {
      text?: string;
      language?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required." });
      return;
    }

    const clean = text.trim();
    if (language === "en" || !ai) {
      res.json({ translatedText: clean, provider: ai ? "passthrough" : "demo" });
      return;
    }

    const cacheKey = `${language}::${clean}`;
    const cached = translationCache.get(cacheKey);
    if (cached) {
      res.json({ translatedText: cached, provider: "gemini-cache" });
      return;
    }

    try {
      const targetLang = LANGUAGE_NAMES[language] || "English";
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Translate the following accessibility/education text naturally and accurately into ${targetLang}. Keep technical terms (like React, TypeScript, HTML, CSS, WCAG, AccessPath, Savannah, LinkedIn) clear, and return ONLY the translated text without quotes or explanations.\n\nText: ${clean}`,
      });
      const translatedText = (response.text || clean).trim();
      translationCache.set(cacheKey, translatedText);
      res.json({ translatedText, provider: "gemini" });
    } catch (err) {
      console.warn("Translation fallback:", err);
      res.json({ translatedText: clean, provider: "fallback" });
    }
  });

  // AI Chosen-Language Page Reader & Deaf/Multilingual Communicator
  app.post("/api/ai-communicate", async (req, res) => {
    const {
      language = "en",
      view = "dashboard",
      isDeaf = false,
      isBlind = false,
      userName = "Learner",
      careerPlan = {},
      pageSummary = "",
      userMessage = "",
    } = req.body as {
      language?: string;
      view?: string;
      isDeaf?: boolean;
      isBlind?: boolean;
      userName?: string;
      careerPlan?: { targetRole?: string; targetTrack?: string; skills?: string[] };
      pageSummary?: string;
      userMessage?: string;
    };

    const targetLang = LANGUAGE_NAMES[language] || "English";

    if (!ai) {
      const demoReplies: Record<string, string> = {
        en: `AI Guide (${view}): ${pageSummary}`,
        am: `የAI ቋንቋ መምሪያ (${view})፡ ሰላም ${userName}። የሥራ ዕቅድዎ ${careerPlan.targetRole || "ቴክኖሎጂ"} ላይ ያተኩራል። ${pageSummary}`,
        om: `Qajeelfama AI (${view}): Akkam ${userName}. Karoorri hojii kee ${careerPlan.targetRole || "teeknooloojii"} irratti xiyyeeffata. ${pageSummary}`,
        so: `Hagaha AI (${view}): Soo dhawoow ${userName}. Qorshahaaga shaqo wuxuu beegsanayaa ${careerPlan.targetRole || "tiknoolajiyada"}. ${pageSummary}`,
        ti: `AI መምርሒ (${view})፡ ሰላም ${userName}። መደብ ስራሕካ ${careerPlan.targetRole || "ቴክኖሎጂ"} እዩ። ${pageSummary}`,
      };
      res.json({
        reply: demoReplies[language] || demoReplies.en,
        provider: "demo",
      });
      return;
    }

    try {
      const systemInstruction = [
        `You are the AccessPath Multilingual AI Communicator & Accessible Page Reader.`,
        `CRITICAL: Respond 100% exclusively in ${targetLang} (use natural ${targetLang} script/alphabet, e.g. Ethiopic Fidäl for Amharic and Tigrinya, Qubee for Afaan Oromo, Somali orthography for Somali).`,
        `User profile: Name="${userName}", Deaf/Hard-of-Hearing=${isDeaf}, Blind/Low-Vision=${isBlind}, Target Role="${careerPlan.targetRole || "Tech Specialist"}", Track="${careerPlan.targetTrack || "Software"}".`,
        isDeaf
          ? `Because the user is Deaf or Hard of Hearing, present clear, scannable written sentences in ${targetLang} that directly read and explain what is on the screen and invite their response via sign, transcribed speech, or text.`
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

      res.json({
        reply: (response.text || "").trim(),
        provider: "gemini",
      });
    } catch (err) {
      console.error("AI communicate error:", err);
      res.status(500).json({ error: "AI communication failed." });
    }
  });

  // Voice Intent & Structured Answer Extraction Endpoint
  app.post("/api/voice-intent", async (req, res) => {
    const {
      transcript,
      language = "en",
      mode = "navigation",
      fieldContext,
      currentView = "dashboard",
      contextSummary = "",
    } = req.body as {
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
    };

    if (!transcript || !transcript.trim()) {
      res.status(400).json({ error: "Transcript is required." });
      return;
    }

    const targetLang = LANGUAGE_NAMES[language] || "English";

    if (!ai) {
      res.json({
        fallbackToLocal: true,
        provider: "local-parser",
      });
      return;
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

Interpret the user's spoken input:
- If they want to skip, go next, go back, repeat the question, or submit the form, set command to "next", "back", "repeat", or "submit".
- Otherwise set command to "fill" and extract the clean answer into filledValue (for example, strip phrases like "my name is" or "I want", normalize spoken email like "abebe at gmail dot com" -> "abebe@gmail.com", and for options pick the closest exact option string(s)).
- For multi-select skills, also populate matchedItems with matching option strings.
- Provide a brief confirmationText in ${targetLang}.`;

        const response = await ai.models.generateContent({
          model: "gemini-4-hydrogen",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                command: {
                  type: Type.STRING,
                  description: "One of: fill, next, back, repeat, submit",
                },
                filledValue: { type: Type.STRING },
                matchedItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                confirmationText: { type: Type.STRING },
              },
              required: ["command", "filledValue", "matchedItems", "confirmationText"],
            },
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        res.json({ ...parsed, provider: "gemini" });
        return;
      }

      if (mode === "onboarding_step2") {
        const prompt = `A blind user just selected accessibility options on step 2 in ${targetLang}.
User transcript: "${transcript}"
Did they say to continue/go to sign-in/next step ("continue"), repeat ("repeat"), or select another option ("stay")?
Return JSON with command ("continue" | "repeat" | "stay") and confirmationText in ${targetLang}.`;

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
        const parsed = JSON.parse(response.text || "{}");
        res.json({ ...parsed, provider: "gemini" });
        return;
      }

      // Hierarchical navigation mode
      const navPrompt = `You are the AccessPath voice navigation assistant speaking ${targetLang}.
Current page view: "${currentView}".
Visible items summary: ${contextSummary}
User spoken command: "${transcript}"

Map the user's request to one action:
- "navigate": open one of these views: "dashboard", "courses", "resources", "progress", "jobs", "tracker", "linkedin", "assistant", "settings"
- "read_major_options": read the numbered list of major sections again
- "read_specific": read the specific items on the current view
- "enroll_course": enroll in course number 1, 2, or 3 (set itemNumber)
- "complete_lesson": complete the next lesson in their active course
- "save_job": bookmark/save job number 1, 2, or 3 (set itemNumber)
- "apply_job": mark job number 1, 2, or 3 as Applied (set itemNumber)
- "check_in": record daily learning check-in
- "ask_ai": the user is asking a general career/learning question (put question in queryText)
- "stop": pause/stop voice assistant listening
- "unknown": unclear command

Respond in JSON with a helpful short replyText in ${targetLang}.`;

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

      const parsed = JSON.parse(response.text || "{}");
      res.json({ ...parsed, provider: "gemini" });
    } catch (err) {
      console.error("Voice intent error:", err);
      res.json({ fallbackToLocal: true, provider: "local-parser" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AccessPath server listening on http://localhost:${PORT}`);
  });
}

startServer();
