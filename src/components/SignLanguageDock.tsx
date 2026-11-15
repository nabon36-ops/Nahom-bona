import React, { useEffect, useRef, useState } from "react";
import {
  AppView,
  LanguageCode,
  SignDetectionResult,
  SignLanguageSystem,
} from "../types";
import { TRANSLATIONS } from "../i18n/translations";
import {
  Camera,
  CameraOff,
  Hand,
  Minimize2,
  Maximize2,
  Scan,
  CheckCircle2,
} from "lucide-react";

interface SignLanguageDockProps {
  language: LanguageCode;
  signLanguageSystem: SignLanguageSystem;
  isOpen: boolean;
  activeCaption: string;
  onToggleOpen: () => void;
  onChangeSignSystem: (sys: SignLanguageSystem) => void;
  onExecuteSignTask: (result: SignDetectionResult) => void;
}

interface QuickSignCommand {
  id: string;
  label: string;
  gestureHint: string;
  actionType: SignDetectionResult["actionType"];
  actionTarget: AppView | "";
  reply: string;
}

const QUICK_SIGNS: QuickSignCommand[] = [
  {
    id: "courses",
    label: "Courses",
    gestureHint: "1 finger / Book sign",
    actionType: "navigate",
    actionTarget: "courses",
    reply: "Opening recommended Savannah courses.",
  },
  {
    id: "jobs",
    label: "Jobs",
    gestureHint: "2 fingers / V-sign",
    actionType: "navigate",
    actionTarget: "jobs",
    reply: "Opening Career Plan matched jobs.",
  },
  {
    id: "tracker",
    label: "Tracker",
    gestureHint: "3 fingers",
    actionType: "navigate",
    actionTarget: "tracker",
    reply: "Opening Job Application Tracker.",
  },
  {
    id: "progress",
    label: "Progress",
    gestureHint: "4 fingers",
    actionType: "navigate",
    actionTarget: "progress",
    reply: "Opening Learning Progress & Milestones.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    gestureHint: "5 fingers spread",
    actionType: "navigate",
    actionTarget: "linkedin",
    reply: "Opening LinkedIn Workspace.",
  },
  {
    id: "complete",
    label: "Finish Lesson",
    gestureHint: "Thumbs up / Confirm",
    actionType: "complete_lesson",
    actionTarget: "",
    reply: "Completing your next active lesson.",
  },
];

export const SignLanguageDock: React.FC<SignLanguageDockProps> = ({
  language,
  signLanguageSystem,
  isOpen,
  activeCaption,
  onToggleOpen,
  onChangeSignSystem,
  onExecuteSignTask,
}) => {
  const t = TRANSLATIONS[language];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [lastResult, setLastResult] = useState<SignDetectionResult | null>(null);
  const [signPhase, setSignPhase] = useState(0);

  // Subtle interpreter hand motion tick when caption updates
  useEffect(() => {
    if (!isOpen) return;
    const id = window.setInterval(() => {
      setSignPhase((p) => (p + 1) % 4);
    }, 900);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setAutoScan(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is unavailable in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setCameraError(
        "Camera permission denied or no camera found. Use quick sign pads below."
      );
    }
  };

  const captureAndDetectSign = async () => {
    if (!videoRef.current || !canvasRef.current || detecting) return;
    const video = videoRef.current;
    if (video.readyState < 2) return;

    const canvas = canvasRef.current;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.75);

    setDetecting(true);
    try {
      const res = await fetch("/api/sign-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: "image/jpeg",
          language,
        }),
      });
      if (res.ok) {
        const result = (await res.json()) as SignDetectionResult;
        setLastResult(result);
        if (result.actionType && result.actionType !== "none") {
          onExecuteSignTask(result);
        }
      }
    } catch {
      setCameraError("Could not process sign frame. Try again.");
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (!cameraActive || !autoScan) return;
    const timer = window.setInterval(() => {
      captureAndDetectSign();
    }, 5000);
    return () => window.clearInterval(timer);
  });

  const handleQuickSign = (cmd: QuickSignCommand) => {
    const result: SignDetectionResult = {
      detectedSign: `${cmd.label} (${cmd.gestureHint})`,
      confidence: 1,
      actionType: cmd.actionType,
      actionTarget: cmd.actionTarget,
      replyInLanguage: cmd.reply,
      provider: "sign-pad",
    };
    setLastResult(result);
    onExecuteSignTask(result);
  };

  // EXCLUSIVELY anchored to the bottom-right corner
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label={t.signDock.openLabel}
          className="inline-flex items-center gap-2.5 px-4 py-3 rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-[#1F2328] dark:text-[#E6EDF3] shadow-lg hover:border-[#0969DA] dark:hover:border-[#58A6FF] text-sm font-semibold"
        >
          <Hand className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF]" aria-hidden="true" />
          <span>{t.signDock.openLabel}</span>
          <Maximize2 className="w-3.5 h-3.5 text-[#656D76] dark:text-[#8B949E]" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label={t.signDock.title}
      className="fixed bottom-4 right-4 z-40 w-[340px] sm:w-[372px] max-w-[calc(100vw-2rem)] rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-[#1F2328] dark:text-[#E6EDF3] shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#D0D7DE] dark:border-[#30363D] flex items-center justify-between gap-2 bg-[#F6F8FA] dark:bg-[#21262D]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Hand className="w-4 h-4 text-[#0969DA] dark:text-[#58A6FF] shrink-0" aria-hidden="true" />
            <h2 className="text-sm font-semibold truncate">{t.signDock.title}</h2>
          </div>
          <p className="text-[11px] text-[#656D76] dark:text-[#8B949E] truncate">
            {t.signDock.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Minimize Sign Language Assistant"
          className="p-2 rounded-md hover:bg-[#EAEEF2] dark:hover:bg-[#30363D] shrink-0"
        >
          <Minimize2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="p-3.5 space-y-3 max-h-[75vh] overflow-y-auto">
        {/* Sign Language System Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-[#656D76] dark:text-[#8B949E]">
              Sign System
            </span>
            <div className="inline-flex rounded-md border border-[#D0D7DE] dark:border-[#30363D] p-0.5 bg-[#F6F8FA] dark:bg-[#0D1117]">
              {(["EthSL", "ASL", "IS"] as SignLanguageSystem[]).map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => onChangeSignSystem(sys)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                    signLanguageSystem === sys
                      ? "bg-[#0969DA] text-white dark:bg-[#58A6FF] dark:text-[#0D1117]"
                      : "text-[#656D76] dark:text-[#8B949E]"
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-[#656D76] dark:text-[#8B949E] leading-snug">
            {t.signDock.languageDisclaimer}
          </p>
        </div>

        {/* Visual Interpreter Avatar + Live Synced Captions */}
        <div className="rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] p-3 flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] flex items-center justify-center shrink-0"
          >
            <svg viewBox="0 0 64 64" className="w-11 h-11">
              {/* Articulated Signer Figure */}
              <circle cx="32" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path
                d="M18 46 C18 34, 46 34, 46 46"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Animated Signing Hands */}
              <path
                d={
                  signPhase % 2 === 0
                    ? "M20 40 L14 27 M44 40 L50 28"
                    : "M20 40 L25 26 M44 40 L39 27"
                }
                fill="none"
                stroke="#0969DA"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx={signPhase % 2 === 0 ? 14 : 25}
                cy={signPhase % 2 === 0 ? 26 : 25}
                r="3.2"
                fill="#0969DA"
              />
              <circle
                cx={signPhase % 2 === 0 ? 50 : 39}
                cy={signPhase % 2 === 0 ? 27 : 26}
                r="3.2"
                fill="#0969DA"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-[#0969DA] dark:text-[#58A6FF]">
              {signLanguageSystem} Visual Gloss
            </div>
            <p className="text-xs leading-snug line-clamp-3 mt-0.5">
              {activeCaption ||
                "Ready to translate voice instructions and detect your sign language responses."}
            </p>
          </div>
        </div>

        {/* Camera Sign Response Detection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.signDock.startCamera}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={captureAndDetectSign}
                  disabled={detecting}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white disabled:opacity-60"
                >
                  <Scan className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{detecting ? "Analyzing..." : t.signDock.detectNow}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  aria-label={t.signDock.stopCamera}
                  className="px-2.5 py-2 text-xs font-medium rounded-md border border-[#CF222E]/40 text-[#CF222E] dark:text-[#F85149] hover:bg-[#CF222E]/10"
                >
                  <CameraOff className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>

          <div
            className={`relative rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-black overflow-hidden ${
              cameraActive ? "block" : "hidden"
            }`}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-36 object-cover -scale-x-100"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {cameraActive && (
            <label className="flex items-center gap-2 text-xs text-[#656D76] dark:text-[#8B949E] cursor-pointer">
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                className="rounded border-[#D0D7DE]"
              />
              <span>{t.signDock.autoScan}</span>
            </label>
          )}

          {cameraError && (
            <p className="text-xs text-[#9A6700] dark:text-[#D29922]">
              {cameraError}
            </p>
          )}
        </div>

        {/* Detected Sign & Executed Task Feedback */}
        {lastResult && (
          <div
            role="status"
            className="rounded-md border border-[#1A7F37]/40 dark:border-[#3FB950]/40 bg-[#1A7F37]/5 dark:bg-[#3FB950]/10 p-2.5 text-xs space-y-1"
          >
            <div className="flex items-center gap-1.5 font-semibold text-[#1A7F37] dark:text-[#3FB950]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {t.signDock.lastDetected}: {lastResult.detectedSign}
              </span>
            </div>
            <p className="text-[#1F2328] dark:text-[#E6EDF3]">
              {t.signDock.executedTask}: {lastResult.replyInLanguage}
            </p>
          </div>
        )}

        {/* Quick Sign Gesture Response Pads */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-[#656D76] dark:text-[#8B949E]">
            {t.signDock.quickSignsTitle}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_SIGNS.map((cmd) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => handleQuickSign(cmd)}
                className="text-left px-2.5 py-2 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#21262D] hover:border-[#0969DA] dark:hover:border-[#58A6FF] transition-colors"
              >
                <div className="text-xs font-semibold truncate">{cmd.label}</div>
                <div className="text-[10px] text-[#656D76] dark:text-[#8B949E] truncate">
                  {cmd.gestureHint}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
