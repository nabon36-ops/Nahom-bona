import "dotenv/config";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer } from "ws";
import {
  getGeminiClient,
  handleAiCommunicate,
  handleAssistant,
  handleHealth,
  handleLinkedInDraft,
  handleSignDetect,
  handleStt,
  handleTranslate,
  handleTts,
  handleVisionCommand,
  handleVisionDescribe,
  handleVoiceIntent,
  LANGUAGE_NAMES,
} from "./server/apiHandlers.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "12mb" }));

  // Optional CORS support if frontend is hosted separately on Netlify and calls a standalone backend
  app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    const out = handleHealth(true);
    res.status(out.status).json(out.body);
  });

  app.post("/api/tts", async (req, res) => {
    const out = await handleTts(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/vision/describe", async (req, res) => {
    const out = await handleVisionDescribe(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/vision/command", async (req, res) => {
    const out = await handleVisionCommand(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/assistant", async (req, res) => {
    const out = await handleAssistant(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/sign-detect", async (req, res) => {
    const out = await handleSignDetect(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/linkedin-draft", async (req, res) => {
    const out = await handleLinkedInDraft(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/stt", async (req, res) => {
    const out = await handleStt(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/translate", async (req, res) => {
    const out = await handleTranslate(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/ai-communicate", async (req, res) => {
    const out = await handleAiCommunicate(req.body || {});
    res.status(out.status).json(out.body);
  });

  app.post("/api/voice-intent", async (req, res) => {
    const out = await handleVoiceIntent(req.body || {});
    res.status(out.status).json(out.body);
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

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (reqUrl.pathname !== "/ws/live") {
      return;
    }

    wss.handleUpgrade(req, socket, head, async (clientWs) => {
      const language = reqUrl.searchParams.get("language") || "en";
      const targetLang = LANGUAGE_NAMES[language] || "English";
      const ai = getGeminiClient();

      if (!ai) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            code: "NO_API_KEY",
            message:
              "GEMINI_API_KEY is not configured on the server for Live API streaming.",
          })
        );
        clientWs.close();
        return;
      }

      let session: Awaited<ReturnType<typeof ai.live.connect>> | null = null;
      let closed = false;

      try {
        session = await ai.live.connect({
          model: "gemini-3.8-live",
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
            },
            systemInstruction: [
              `You are the AccessPath Real-Time Blind Visual Assistant.`,
              `Always speak and transcribe exclusively in ${targetLang}.`,
              `You receive live camera frames and microphone audio from a blind or visually impaired user.`,
              `Keep spoken descriptions concise (1-3 crisp sentences), practical, and focused on objects, people, furniture, printed text (OCR), colors, doors, stairs, and potential hazards.`,
              `Warn immediately if stairs, drop-offs, moving objects, or obstacles appear in view.`,
              `SAFETY RULE: Never claim a path is guaranteed safe or clear based solely on a camera frame, and remind the user that this assistant does not replace a white cane or guide dog.`,
            ].join("\n"),
          },
          callbacks: {
            onopen: () => {
              if (!closed && clientWs.readyState === clientWs.OPEN) {
                clientWs.send(JSON.stringify({ type: "ready", language }));
              }
            },
            onmessage: (message: LiveServerMessage) => {
              if (closed || clientWs.readyState !== clientWs.OPEN) return;
              const content = message.serverContent;

              if (content?.inputTranscription?.text) {
                clientWs.send(
                  JSON.stringify({
                    type: "inputTranscript",
                    text: content.inputTranscription.text,
                  })
                );
              }

              if (content?.outputTranscription?.text) {
                clientWs.send(
                  JSON.stringify({
                    type: "outputTranscript",
                    text: content.outputTranscription.text,
                  })
                );
              }

              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: "audio",
                      data: part.inlineData.data,
                    })
                  );
                }
              }

              if (content?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }

              if (content?.turnComplete) {
                clientWs.send(JSON.stringify({ type: "turnComplete" }));
              }
            },
            onerror: (err: unknown) => {
              const detail = err instanceof Error ? err.message : String(err);
              console.warn("Gemini Live session error:", detail);
              if (!closed && clientWs.readyState === clientWs.OPEN) {
                clientWs.send(
                  JSON.stringify({
                    type: "error",
                    detail,
                    message:
                      "Real-time Gemini Live connection interrupted. Switching cleanly to turn-based voice and vision.",
                  })
                );
              }
            },
            onclose: (ev?: unknown) => {
              const reason =
                ev && typeof ev === "object" && "reason" in ev
                  ? String((ev as { reason?: unknown }).reason || "")
                  : "";
              if (!closed && clientWs.readyState === clientWs.OPEN) {
                clientWs.send(JSON.stringify({ type: "closed", reason }));
              }
            },
          },
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error("Failed to open Gemini Live session:", detail);
        if (clientWs.readyState === clientWs.OPEN) {
          clientWs.send(
            JSON.stringify({
              type: "error",
              code: "LIVE_CONNECT_FAILED",
              detail,
              message:
                "Could not establish Gemini Live WebSocket session; using turn-based Vision & Voice mode.",
            })
          );
          clientWs.close();
        }
        return;
      }

      clientWs.on("message", (raw) => {
        if (!session || closed) return;
        try {
          const msg = JSON.parse(raw.toString()) as {
            type?: string;
            data?: string;
            text?: string;
          };
          if (msg.type === "audio" && msg.data) {
            session.sendRealtimeInput({
              audio: { data: msg.data, mimeType: "audio/pcm;rate=16000" },
            });
          } else if (msg.type === "video" && msg.data) {
            session.sendRealtimeInput({
              video: { data: msg.data, mimeType: "image/jpeg" },
            });
          } else if (msg.type === "text" && msg.text) {
            session.sendClientContent({
              turns: [{ role: "user", parts: [{ text: msg.text }] }],
              turnComplete: true,
            });
          }
        } catch {
          // Ignore malformed frame messages
        }
      });

      clientWs.on("close", () => {
        closed = true;
        try {
          session?.close();
        } catch {
          // Ignore close errors
        }
      });
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`AccessPath server listening on http://localhost:${PORT}`);
  });
}

startServer();
