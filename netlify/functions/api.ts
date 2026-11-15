import {
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
} from "../../server/apiHandlers.ts";

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
    });
  }

  const url = new URL(req.url);
  // Support both /api/<route> (via netlify.toml redirect) and /.netlify/functions/api/<route>
  const normalizedPath = url.pathname
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "");

  if (req.method === "GET" && (normalizedPath === "/health" || normalizedPath === "")) {
    const out = handleHealth(false);
    return jsonResponse(out.status, out.body);
  }

  let body: Record<string, unknown> = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse(400, { error: "Invalid JSON request body." });
    }
  }

  switch (normalizedPath) {
    case "/tts": {
      const out = await handleTts(body);
      return jsonResponse(out.status, out.body);
    }
    case "/vision/describe": {
      const out = await handleVisionDescribe(body);
      return jsonResponse(out.status, out.body);
    }
    case "/vision/command": {
      const out = await handleVisionCommand(body);
      return jsonResponse(out.status, out.body);
    }
    case "/assistant": {
      const out = await handleAssistant(body);
      return jsonResponse(out.status, out.body);
    }
    case "/sign-detect": {
      const out = await handleSignDetect(body);
      return jsonResponse(out.status, out.body);
    }
    case "/linkedin-draft": {
      const out = await handleLinkedInDraft(body);
      return jsonResponse(out.status, out.body);
    }
    case "/stt": {
      const out = await handleStt(body);
      return jsonResponse(out.status, out.body);
    }
    case "/translate": {
      const out = await handleTranslate(body);
      return jsonResponse(out.status, out.body);
    }
    case "/ai-communicate": {
      const out = await handleAiCommunicate(body);
      return jsonResponse(out.status, out.body);
    }
    case "/voice-intent": {
      const out = await handleVoiceIntent(body);
      return jsonResponse(out.status, out.body);
    }
    default:
      return jsonResponse(404, { error: `Unknown API route: ${normalizedPath}` });
  }
}
