import React, { useEffect, useMemo, useRef, useState } from "react";
import { LanguageCode, SignLanguageSystem } from "../types";
import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  Hand,
} from "lucide-react";

interface HandPose {
  lx: number;
  ly: number;
  rx: number;
  ry: number;
  lShape: "open" | "fist" | "point" | "flat";
  rShape: "open" | "fist" | "point" | "flat";
  headTilt?: number;
}

interface SignTermTutorial {
  id: string;
  category: "Greetings & Essentials" | "Learning & Career";
  durationSec: number;
  labels: Record<LanguageCode, string>;
  ethiopicFidel: string;
  ethslNote: string;
  aslComparisonNote: string;
  steps: [string, string, string];
  keyframes: [HandPose, HandPose, HandPose];
}

const SIGN_BASIC_TERMS: SignTermTutorial[] = [
  {
    id: "term-hello",
    category: "Greetings & Essentials",
    durationSec: 6,
    labels: {
      en: "Hello / Peace",
      am: "ሰላም (Selam)",
      om: "Nagaa / Akkam",
      ar: "مرحباً / السلام",
      fr: "Bonjour / Paix",
      sw: "Hujambo / Amani",
      so: "Nabad / Salaan",
      ti: "ሰላም (Selam)",
    },
    ethiopicFidel: "ሰላም",
    ethslNote:
      "EthSL: Open palm near the temple arcs gently outward with a warm expression.",
    aslComparisonNote:
      "ASL uses a crisp forehead salute; EthSL softens the arc outward.",
    steps: [
      "Raise dominant open hand beside your temple, palm facing outward.",
      "Arc the hand smoothly forward and slightly down toward the viewer.",
      "Hold briefly in neutral chest space with a welcoming nod.",
    ],
    keyframes: [
      { lx: 112, ly: 175, rx: 212, ry: 78, lShape: "open", rShape: "open", headTilt: 0 },
      { lx: 112, ly: 175, rx: 238, ry: 95, lShape: "open", rShape: "open", headTilt: 2 },
      { lx: 112, ly: 175, rx: 245, ry: 120, lShape: "open", rShape: "open", headTilt: 0 },
    ],
  },
  {
    id: "term-thank-you",
    category: "Greetings & Essentials",
    durationSec: 6,
    labels: {
      en: "Thank You",
      am: "አመሰግናለሁ",
      om: "Galatoomi",
      ar: "شكراً لك",
      fr: "Merci",
      sw: "Asante",
      so: "Mahadsanid",
      ti: "የቐንየለይ",
    },
    ethiopicFidel: "አመሰግናለሁ",
    ethslNote:
      "EthSL: Flat fingertips touch near the chin and extend forward cleanly.",
    aslComparisonNote:
      "Similar chin-to-forward path; EthSL often pairs with a slight respectful bow.",
    steps: [
      "Place flat dominant fingertips lightly just below your chin.",
      "Sweep the flat hand forward and slightly downward toward the listener.",
      "Pause with palm facing upward in an appreciative gesture.",
    ],
    keyframes: [
      { lx: 112, ly: 178, rx: 168, ry: 96, lShape: "open", rShape: "flat", headTilt: 0 },
      { lx: 112, ly: 178, rx: 196, ry: 118, lShape: "open", rShape: "flat", headTilt: 4 },
      { lx: 112, ly: 178, rx: 220, ry: 136, lShape: "open", rShape: "flat", headTilt: 2 },
    ],
  },
  {
    id: "term-learn",
    category: "Learning & Career",
    durationSec: 6,
    labels: {
      en: "Learn / Study",
      am: "መማር (Memar)",
      om: "Barachuu",
      ar: "تعلّم / دراسة",
      fr: "Apprendre / Étudier",
      sw: "Jifunze / Soma",
      so: "Barasho",
      ti: "ምምሃር",
    },
    ethiopicFidel: "መማር",
    ethslNote:
      "EthSL: Gather knowledge from an open base palm upward to the forehead.",
    aslComparisonNote:
      "Draws upward from the open palm to the temple/forehead to show acquiring skill.",
    steps: [
      "Hold non-dominant palm flat in front of chest; hover dominant hand above it.",
      "Close dominant fingertips upward as if lifting information from a page.",
      "Bring gathered fingertips to the forehead to signify understanding.",
    ],
    keyframes: [
      { lx: 134, ly: 158, rx: 162, ry: 146, lShape: "flat", rShape: "open" },
      { lx: 134, ly: 158, rx: 176, ry: 108, lShape: "flat", rShape: "point" },
      { lx: 134, ly: 158, rx: 184, ry: 68, lShape: "flat", rShape: "point" },
    ],
  },
  {
    id: "term-work",
    category: "Learning & Career",
    durationSec: 6,
    labels: {
      en: "Work / Career",
      am: "ሥራ (Sira)",
      om: "Hojii",
      ar: "العمل / المسار",
      fr: "Travail / Carrière",
      sw: "Kazi / Taaluma",
      so: "Shaqo",
      ti: "ስራሕ",
    },
    ethiopicFidel: "ሥራ",
    ethslNote:
      "EthSL: Both fists meet at the wrist with two steady rhythmic taps.",
    aslComparisonNote:
      "Recognized across EthSL and ASL with two crisp downward wrist taps.",
    steps: [
      "Form two relaxed fists in front of your torso, palms facing down.",
      "Tap the base of the dominant wrist onto the back of the base wrist.",
      "Lift slightly and repeat a second steady tap.",
    ],
    keyframes: [
      { lx: 142, ly: 156, rx: 182, ry: 134, lShape: "fist", rShape: "fist" },
      { lx: 144, ly: 158, rx: 164, ry: 148, lShape: "fist", rShape: "fist" },
      { lx: 144, ly: 156, rx: 166, ry: 142, lShape: "fist", rShape: "fist" },
    ],
  },
  {
    id: "term-course",
    category: "Learning & Career",
    durationSec: 6,
    labels: {
      en: "Course / Book",
      am: "ትምህርት / መጽሐፍ",
      om: "Koorsii / Kitaaba",
      ar: "دورة / كتاب",
      fr: "Cours / Livre",
      sw: "Kozi / Kitabu",
      so: "Koorso / Buug",
      ti: "ትምህርቲ / መጽሓፍ",
    },
    ethiopicFidel: "መጽሐፍ",
    ethslNote:
      "EthSL: Palms press together centrally and open outward like a book.",
    aslComparisonNote:
      "Universal iconic book opening motion used in EthSL classrooms.",
    steps: [
      "Bring both flat palms together in front of your chest, thumbs facing up.",
      "Hinge wrists open outward while keeping pinky edges close together.",
      "Hold both open palms facing up as if reading a course module.",
    ],
    keyframes: [
      { lx: 152, ly: 150, rx: 168, ry: 150, lShape: "flat", rShape: "flat" },
      { lx: 136, ly: 152, rx: 184, ry: 152, lShape: "flat", rShape: "flat" },
      { lx: 120, ly: 154, rx: 200, ry: 154, lShape: "open", rShape: "open" },
    ],
  },
  {
    id: "term-help",
    category: "Greetings & Essentials",
    durationSec: 6,
    labels: {
      en: "Help / Support",
      am: "እርዳታ (Erdata)",
      om: "Gargaarsa",
      ar: "مساعدة / دعم",
      fr: "Aide / Soutien",
      sw: "Msaada",
      so: "Caawimo",
      ti: "ሓገዝ",
    },
    ethiopicFidel: "እርዳታ",
    ethslNote:
      "EthSL: Supporting flat palm lifts the closed fist gently upward.",
    aslComparisonNote:
      "Moves upward together; direction toward self or viewer shows who receives help.",
    steps: [
      "Rest a closed dominant fist lightly on your open non-dominant palm.",
      "Lift both hands together upward toward chest height.",
      "Hold steadily to signal offering or requesting assistance.",
    ],
    keyframes: [
      { lx: 148, ly: 168, rx: 160, ry: 154, lShape: "flat", rShape: "fist" },
      { lx: 148, ly: 148, rx: 160, ry: 134, lShape: "flat", rShape: "fist" },
      { lx: 148, ly: 132, rx: 160, ry: 118, lShape: "flat", rShape: "fist" },
    ],
  },
];

interface SignLanguageBasicsSectionProps {
  language: LanguageCode;
  signLanguageSystem: SignLanguageSystem;
  reducedMotion: boolean;
  onChangeSignSystem: (sys: SignLanguageSystem) => void;
  onSpeakText: (text: string) => void;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shape: HandPose["rShape"],
  color: string,
  isDark: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = isDark ? "#0D1117" : "#FFFFFF";
  ctx.lineWidth = 2;

  if (shape === "fist") {
    ctx.beginPath();
    ctx.roundRect(-12, -12, 24, 24, 7);
    ctx.fill();
    ctx.stroke();
  } else if (shape === "point") {
    ctx.beginPath();
    ctx.roundRect(-9, -6, 18, 18, 6);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-3, -24, 6, 20, 3);
    ctx.fill();
  } else if (shape === "flat") {
    ctx.beginPath();
    ctx.roundRect(-11, -18, 22, 28, 6);
    ctx.fill();
    ctx.stroke();
  } else {
    // Open fingers
    ctx.beginPath();
    ctx.roundRect(-11, -8, 22, 18, 6);
    ctx.fill();
    for (let i = -8; i <= 8; i += 5.3) {
      ctx.beginPath();
      ctx.roundRect(i - 2, -22, 4, 15, 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export const SignLanguageBasicsSection: React.FC<SignLanguageBasicsSectionProps> = ({
  language,
  signLanguageSystem,
  reducedMotion,
  onChangeSignSystem,
  onSpeakText,
}) => {
  const [selectedId, setSelectedId] = useState<string>(SIGN_BASIC_TERMS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [speed, setSpeed] = useState<number>(1);
  const [practicedIds, setPracticedIds] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const visibleTerms = useMemo(() => {
    if (categoryFilter === "All") return SIGN_BASIC_TERMS;
    return SIGN_BASIC_TERMS.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  const activeTerm = useMemo(
    () =>
      SIGN_BASIC_TERMS.find((t) => t.id === selectedId) || SIGN_BASIC_TERMS[0],
    [selectedId]
  );

  // Playback loop for tutorial video canvas
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        const next = prev + (dt * speed) / activeTerm.durationSec;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, speed, activeTerm.durationSec]);

  // Draw current tutorial video frame onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains("dark");
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = isDark ? "#0D1117" : "#F6F8FA";
    ctx.fillRect(0, 0, w, h);

    // Subtle frame grid
    ctx.strokeStyle = isDark ? "#21262D" : "#E5E9F0";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    const [k0, k1, k2] = activeTerm.keyframes;
    let pose: HandPose;
    let stepIdx: number;

    if (progress < 0.5) {
      const localT = progress * 2;
      stepIdx = progress < 0.25 ? 0 : 1;
      pose = {
        lx: lerp(k0.lx, k1.lx, localT),
        ly: lerp(k0.ly, k1.ly, localT),
        rx: lerp(k0.rx, k1.rx, localT),
        ry: lerp(k0.ry, k1.ry, localT),
        lShape: localT < 0.5 ? k0.lShape : k1.lShape,
        rShape: localT < 0.5 ? k0.rShape : k1.rShape,
        headTilt: lerp(k0.headTilt || 0, k1.headTilt || 0, localT),
      };
    } else {
      const localT = (progress - 0.5) * 2;
      stepIdx = progress < 0.75 ? 1 : 2;
      pose = {
        lx: lerp(k1.lx, k2.lx, localT),
        ly: lerp(k1.ly, k2.ly, localT),
        rx: lerp(k1.rx, k2.rx, localT),
        ry: lerp(k1.ry, k2.ry, localT),
        lShape: localT < 0.5 ? k1.lShape : k2.lShape,
        rShape: localT < 0.5 ? k1.rShape : k2.rShape,
        headTilt: lerp(k1.headTilt || 0, k2.headTilt || 0, localT),
      };
    }

    // Motion trail path (right & left hands)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isDark ? "rgba(88,166,255,0.45)" : "rgba(9,105,218,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(k0.rx, k0.ry);
    ctx.lineTo(k1.rx, k1.ry);
    ctx.lineTo(k2.rx, k2.ry);
    ctx.stroke();
    ctx.restore();

    // Signer torso & head landmarks
    ctx.strokeStyle = isDark ? "#8B949E" : "#57606A";
    ctx.lineWidth = 3;

    // Shoulders / torso
    ctx.beginPath();
    ctx.moveTo(96, 210);
    ctx.quadraticCurveTo(100, 128, 160, 128);
    ctx.quadraticCurveTo(220, 128, 224, 210);
    ctx.stroke();

    // Head
    ctx.save();
    ctx.translate(160, 72);
    ctx.rotate(((pose.headTilt || 0) * Math.PI) / 180);
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "#161B22" : "#FFFFFF";
    ctx.fill();
    ctx.stroke();
    // Eyes & expression
    ctx.fillStyle = isDark ? "#8B949E" : "#57606A";
    ctx.beginPath();
    ctx.arc(-8, -4, 2.2, 0, Math.PI * 2);
    ctx.arc(8, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 4, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Arms connecting shoulders to hands
    ctx.strokeStyle = isDark ? "#58A6FF" : "#0969DA";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(106, 152);
    ctx.quadraticCurveTo(104, 185, pose.lx, pose.ly);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(214, 152);
    ctx.quadraticCurveTo(220, 185, pose.rx, pose.ry);
    ctx.stroke();

    // Hands
    drawHand(
      ctx,
      pose.lx,
      pose.ly,
      pose.lShape,
      isDark ? "#3FB950" : "#1A7F37",
      isDark
    );
    drawHand(
      ctx,
      pose.rx,
      pose.ry,
      pose.rShape,
      isDark ? "#58A6FF" : "#0969DA",
      isDark
    );

    // Top-left Sign System & Fidel tag inside frame
    ctx.fillStyle = isDark ? "#E6EDF3" : "#1F2328";
    ctx.font = "600 12px 'Plus Jakarta Sans', 'Noto Sans Ethiopic', sans-serif";
    ctx.fillText(
      `${signLanguageSystem} · ${activeTerm.ethiopicFidel}`,
      18,
      28
    );

    // Bottom caption strip inside video canvas
    ctx.fillStyle = isDark ? "rgba(22, 27, 34, 0.9)" : "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(10, h - 42, w - 20, 32);
    ctx.fillStyle = isDark ? "#E6EDF3" : "#1F2328";
    ctx.font = "500 11px 'Plus Jakarta Sans', 'Noto Sans Ethiopic', sans-serif";
    const stepText = activeTerm.steps[stepIdx] || activeTerm.steps[0];
    ctx.fillText(stepText.slice(0, 56) + (stepText.length > 56 ? "..." : ""), 18, h - 22);
  }, [activeTerm, progress, signLanguageSystem]);

  const handleSelectTerm = (id: string) => {
    setSelectedId(id);
    setProgress(0);
    if (!reducedMotion) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePracticed = (id: string) => {
    setPracticedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const currentStepIndex = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  const elapsedSec = Math.round(progress * activeTerm.durationSec);

  return (
    <section
      aria-labelledby="sign-basics-heading"
      className="surface-card rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#0969DA] dark:text-[#58A6FF]">
            <Hand className="w-4 h-4" aria-hidden="true" />
            <span>
              Ethiopic-Based Sign Tutorials · {signLanguageSystem} ({practicedIds.length}/{SIGN_BASIC_TERMS.length} practiced)
            </span>
          </div>
          <h2 id="sign-basics-heading" className="text-xl font-bold tracking-tight">
            Sign Language Basics
          </h2>
          <p className="text-sm text-[#656D76] dark:text-[#8B949E]">
            Short guided video tutorials for essential greetings, study terms, and career vocabulary in{" "}
            <span className="font-medium text-[#1F2328] dark:text-[#E6EDF3]">
              {signLanguageSystem === "EthSL"
                ? "Ethiopian Sign Language (EthSL)"
                : signLanguageSystem === "ASL"
                ? "American Sign Language (ASL)"
                : "International Sign (IS)"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Select sign system"
            className="inline-flex rounded-md border border-[#D0D7DE] dark:border-[#30363D] p-0.5 bg-[#F6F8FA] dark:bg-[#0D1117]"
          >
            {(["EthSL", "ASL", "IS"] as SignLanguageSystem[]).map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => onChangeSignSystem(sys)}
                aria-pressed={signLanguageSystem === sys}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  signLanguageSystem === sys
                    ? "bg-[#0969DA] text-white dark:bg-[#58A6FF] dark:text-[#0D1117]"
                    : "text-[#656D76] dark:text-[#8B949E] hover:text-[#1F2328] dark:hover:text-[#E6EDF3]"
                }`}
              >
                {sys}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter sign language basic terms"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
          >
            <option value="All">All Terms</option>
            <option value="Greetings & Essentials">Greetings &amp; Essentials</option>
            <option value="Learning & Career">Learning &amp; Career</option>
          </select>
        </div>
      </div>

      {/* Main Split: Video Tutorial Player + Term Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start">
        {/* Interactive Short Video Tutorial Player */}
        <div className="rounded-lg border border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117] p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-[#656D76] dark:text-[#8B949E]">
                {activeTerm.category} · {activeTerm.ethiopicFidel}
              </div>
              <h3 className="text-base font-bold mt-0.5">
                {activeTerm.labels[language]}
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                onSpeakText(
                  `${activeTerm.labels[language]}. ${activeTerm.steps.join(" ")}`
                )
              }
              aria-label={`Hear ${activeTerm.labels[language]} instruction`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
            >
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Voice</span>
            </button>
          </div>

          <canvas
            ref={canvasRef}
            width={320}
            height={230}
            aria-label={`Animated sign tutorial for ${activeTerm.labels[language]}`}
            className="w-full h-auto rounded-md border border-[#D0D7DE] dark:border-[#30363D]"
          />

          {/* Scrubber & Video Controls */}
          <div className="space-y-2">
            <input
              type="range"
              aria-label="Tutorial video timeline"
              min={0}
              max={100}
              value={Math.round(progress * 100)}
              onChange={(e) => {
                setIsPlaying(false);
                setProgress(Number(e.target.value) / 100);
              }}
              className="w-full"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (progress >= 1) setProgress(0);
                    setIsPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{progress >= 1 ? "Replay" : "Play Clip"}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setProgress(0);
                  }}
                  aria-label="Restart tutorial clip"
                  className="p-1.5 rounded-md border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-[#656D76] dark:text-[#8B949E]">
                <select
                  aria-label="Playback speed"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="px-1.5 py-1 rounded border border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22] text-xs"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1.0x</option>
                </select>
                <span>
                  00:0{elapsedSec} / 00:0{activeTerm.durationSec}
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-step Keyframes (Reduced-motion friendly) */}
          <div className="space-y-1.5 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setProgress(idx === 0 ? 0 : idx === 1 ? 0.5 : 1);
                  }}
                  className={`py-1 text-xs font-medium rounded border ${
                    currentStepIndex === idx
                      ? "border-[#0969DA] bg-[#0969DA]/10 text-[#0969DA] dark:text-[#58A6FF]"
                      : "border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed">
              {activeTerm.steps[currentStepIndex]}
            </p>
            <p className="text-[11px] text-[#656D76] dark:text-[#8B949E]">
              {signLanguageSystem === "EthSL"
                ? activeTerm.ethslNote
                : activeTerm.aslComparisonNote}
            </p>
          </div>
        </div>

        {/* Basic Terms Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleTerms.map((term) => {
            const isSelected = term.id === activeTerm.id;
            const isPracticed = practicedIds.includes(term.id);
            return (
              <div
                key={term.id}
                className={`rounded-lg border p-4 flex flex-col justify-between gap-3 transition-colors ${
                  isSelected
                    ? "border-[#0969DA] dark:border-[#58A6FF] bg-[#0969DA]/5 dark:bg-[#58A6FF]/10"
                    : "border-[#D0D7DE] dark:border-[#30363D] bg-[#F6F8FA] dark:bg-[#0D1117]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#656D76] dark:text-[#8B949E]">
                    <span>{term.category}</span>
                    <span className="font-mono tabular-nums">{term.durationSec}s clip</span>
                  </div>
                  <h3 className="text-sm font-bold">{term.labels[language]}</h3>
                  <p className="text-xs text-[#656D76] dark:text-[#8B949E]">
                    {term.labels.en} · {term.ethiopicFidel} · {term.labels.om}
                  </p>
                  <p className="text-xs text-[#656D76] dark:text-[#8B949E] line-clamp-2 pt-1">
                    {signLanguageSystem === "EthSL"
                      ? term.ethslNote
                      : term.aslComparisonNote}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D0D7DE] dark:border-[#30363D]">
                  <button
                    type="button"
                    onClick={() => handleSelectTerm(term.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0969DA] hover:bg-[#0550AE] text-white dark:bg-[#238636] dark:hover:bg-[#2EA043]"
                  >
                    <Play className="w-3 h-3" aria-hidden="true" />
                    <span>{isSelected ? "Active Tutorial" : "Watch Sign"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePracticed(term.id)}
                    aria-pressed={isPracticed}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border ${
                      isPracticed
                        ? "border-[#1A7F37]/50 text-[#1A7F37] dark:text-[#3FB950] bg-[#1A7F37]/10"
                        : "border-[#D0D7DE] dark:border-[#30363D] bg-white dark:bg-[#161B22]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isPracticed ? "Practiced" : "Mark Done"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
