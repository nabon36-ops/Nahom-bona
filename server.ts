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
