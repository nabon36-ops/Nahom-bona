import { LanguageCode } from "../types";
import { liveWsUrl } from "./apiConfig";

export interface LiveSessionCallbacks {
  onReady?: () => void;
  onInputTranscript?: (text: string) => void;
  onOutputTranscript?: (text: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const numSamples = Math.floor(bytes.byteLength / 2);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    out[i] = view.getInt16(i * 2, true) / 32768;
  }
  return out;
}

export class LiveVisionSession {
  private ws: WebSocket | null = null;
  private inputCtx: AudioContext | null = null;
  private outputCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isDisposed = false;
  private playbackRate = 1;
  private callbacks: LiveSessionCallbacks;

  constructor(callbacks: LiveSessionCallbacks) {
    this.callbacks = callbacks;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = Math.max(0.7, Math.min(1.25, rate));
  }

  public async connect(language: LanguageCode, micStream: MediaStream): Promise<boolean> {
    if (this.isDisposed) return false;

    const url = liveWsUrl(language);
    return new Promise((resolve) => {
      let settled = false;
      const ws = new WebSocket(url);
      this.ws = ws;

      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          this.dispose();
          resolve(false);
        }
      }, 6000);

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type?: string;
            data?: string;
            text?: string;
            message?: string;
          };

          if (msg.type === "ready") {
            if (!settled) {
              settled = true;
              window.clearTimeout(timeout);
              await this.startMicStreaming(micStream);
              this.callbacks.onReady?.();
              resolve(true);
            }
          } else if (msg.type === "audio" && msg.data) {
            this.enqueueAudioChunk(msg.data);
          } else if (msg.type === "inputTranscript" && msg.text) {
            this.callbacks.onInputTranscript?.(msg.text);
          } else if (msg.type === "outputTranscript" && msg.text) {
            this.callbacks.onOutputTranscript?.(msg.text);
          } else if (msg.type === "interrupted") {
            this.interruptPlayback();
          } else if (msg.type === "turnComplete") {
            if (this.activeSources.length === 0) {
              this.callbacks.onSpeakingChange?.(false);
            }
          } else if (msg.type === "error") {
            if (!settled) {
              settled = true;
              window.clearTimeout(timeout);
              this.dispose();
              resolve(false);
            } else {
              this.callbacks.onError?.(msg.message || "Live stream error.");
            }
          }
        } catch {
          // Ignore invalid JSON
        }
      };

      ws.onerror = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          this.dispose();
          resolve(false);
        }
      };

      ws.onclose = () => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          resolve(false);
        }
        this.callbacks.onClose?.();
      };
    });
  }

  private async startMicStreaming(micStream: MediaStream) {
    if (this.isDisposed) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    this.inputCtx = new AudioCtx({ sampleRate: 16000 });
    this.outputCtx = new AudioCtx({ sampleRate: 24000 });
    this.nextStartTime = this.outputCtx.currentTime;

    this.micSource = this.inputCtx.createMediaStreamSource(micStream);
    this.processor = this.inputCtx.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isDisposed) return;
      const channelData = e.inputBuffer.getChannelData(0);
      const base64 = float32ToPcm16Base64(channelData);
      this.ws.send(JSON.stringify({ type: "audio", data: base64 }));
    };

    this.micSource.connect(this.processor);
    this.processor.connect(this.inputCtx.destination);
  }

  private enqueueAudioChunk(base64Pcm: string) {
    if (!this.outputCtx || this.isDisposed) return;
    if (this.outputCtx.state === "suspended") {
      this.outputCtx.resume().catch(() => {});
    }

    const samples = base64Pcm16ToFloat32(base64Pcm);
    if (samples.length === 0) return;

    const buffer = this.outputCtx.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);

    const source = this.outputCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = this.playbackRate;
    source.connect(this.outputCtx.destination);

    const now = this.outputCtx.currentTime;
    const startAt = Math.max(now + 0.01, this.nextStartTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration / this.playbackRate;

    this.activeSources.push(source);
    this.callbacks.onSpeakingChange?.(true);

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source);
      if (this.activeSources.length === 0) {
        this.callbacks.onSpeakingChange?.(false);
      }
    };
  }

  public sendVideoFrame(base64Jpeg: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isDisposed) return;
    const clean = base64Jpeg.replace(/^data:image\/\w+;base64,/, "");
    this.ws.send(JSON.stringify({ type: "video", data: clean }));
  }

  public sendTextPrompt(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.isDisposed) return;
    this.ws.send(JSON.stringify({ type: "text", text }));
  }

  public interruptPlayback() {
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already stopped sources
      }
    });
    this.activeSources = [];
    if (this.outputCtx) {
      this.nextStartTime = this.outputCtx.currentTime;
    }
    this.callbacks.onSpeakingChange?.(false);
  }

  public dispose() {
    this.isDisposed = true;
    this.interruptPlayback();
    try {
      this.processor?.disconnect();
      this.micSource?.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    this.inputCtx?.close().catch(() => {});
    this.outputCtx?.close().catch(() => {});
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.ws.close();
    }
    this.ws = null;
  }
}
