import React, { useEffect, useRef, useState, useCallback } from "react";
import { proctoringApi } from "../services/api";
import {
  Camera,
  CameraOff,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Maximize2,
  Activity,
  Scan,
  Sparkles,
  RefreshCw,
  Video,
} from "lucide-react";
import { ViolationType } from "../types";

interface ProctoringMonitorProps {
  attemptId: string;
  examId: string;
  onViolation?: (type: ViolationType, message: string) => void;
}

export const ProctoringMonitor: React.FC<ProctoringMonitorProps> = ({
  attemptId,
  examId,
  onViolation,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const [violationCount, setViolationCount] = useState<number>(0);
  const [activeAlert, setActiveAlert] = useState<{ type: string; message: string } | null>(null);
  const [aiStatus, setAiStatus] = useState<"VERIFIED" | "LOOKING_AWAY" | "NO_FACE" | "ANOMALY">("VERIFIED");
  const [confidence, setConfidence] = useState<number>(97);
  const [useSimulatedMode, setUseSimulatedMode] = useState<boolean>(false);
  const [simulationFaceState, setSimulationFaceState] = useState<"NORMAL" | "AWAY" | "NO_FACE">("NORMAL");

  // Track violation cooldowns to prevent API spam
  const lastViolationTimeRef = useRef<Record<string, number>>({});
  const absenceCounterRef = useRef<number>(0);
  const gazeCounterRef = useRef<number>(0);

  // Trigger violation log with rate limiting & backend sync
  const triggerViolation = useCallback(
    async (type: ViolationType, description: string, cooldownSec: number = 6) => {
      const now = Date.now();
      const lastLogged = lastViolationTimeRef.current[type] || 0;

      if (now - lastLogged < cooldownSec * 1000) {
        return; // suppress duplicate violation within cooldown window
      }

      lastViolationTimeRef.current[type] = now;
      setViolationCount((prev) => prev + 1);
      setActiveAlert({ type, message: description });

      if (onViolation) {
        onViolation(type, description);
      }

      try {
        await proctoringApi.logViolation({
          attemptId,
          examId,
          type,
          description,
        });
      } catch (e) {
        console.error("Failed to log proctoring violation to backend:", e);
      }

      setTimeout(() => {
        setActiveAlert((current) => (current?.type === type ? null : current));
      }, 4500);
    },
    [attemptId, examId, onViolation]
  );

  // 1. Camera Initialization
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
        setCameraActive(true);
        setUseSimulatedMode(false);
      }
    } catch (err: any) {
      console.warn("Webcam access unavailable or blocked:", err);
      setCameraActive(false);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied by browser. Please enable camera permissions."
          : "Webcam not detected or busy in another application."
      );
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Real-Time Automated AI Video Telemetry & Analysis Loop
  useEffect(() => {
    const analysisInterval = setInterval(() => {
      // In Real Camera Mode: Perform Canvas Frame Image Analysis
      if (cameraActive && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (video.readyState >= 2 && ctx) {
          canvas.width = 120;
          canvas.height = 90;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            let totalBrightness = 0;
            let skinPixelCount = 0;
            let skinXSum = 0;
            let skinYSum = 0;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const brightness = (r + g + b) / 3;
              totalBrightness += brightness;

              // Heuristic skin-tone chrominance & luminance detection
              if (
                r > 60 &&
                g > 40 &&
                b > 20 &&
                r > g &&
                r > b &&
                r - g > 12 &&
                Math.abs(r - g) > 10
              ) {
                skinPixelCount++;
                const pixelIndex = i / 4;
                const x = pixelIndex % canvas.width;
                const y = Math.floor(pixelIndex / canvas.width);
                skinXSum += x;
                skinYSum += y;
              }
            }

            const avgBrightness = totalBrightness / (data.length / 4);
            const skinCoverage = skinPixelCount / (canvas.width * canvas.height);

            // Condition A: Camera covered or total blackout
            if (avgBrightness < 12) {
              absenceCounterRef.current += 1;
              setAiStatus("NO_FACE");
              setConfidence(15);
              if (absenceCounterRef.current >= 2) {
                triggerViolation(
                  "NO_FACE_DETECTED",
                  "AI Alert: Camera obstructed or lighting blackout detected."
                );
              }
              return;
            }

            // Condition B: No face / skin centroid in frame
            if (skinCoverage < 0.04) {
              absenceCounterRef.current += 1;
              gazeCounterRef.current = 0;
              setAiStatus("NO_FACE");
              setConfidence(Math.max(10, Math.round(skinCoverage * 400)));

              if (absenceCounterRef.current >= 2) {
                triggerViolation(
                  "NO_FACE_DETECTED",
                  "AI Alert: Face absence detected: Candidate moved out of camera frame."
                );
              }
            } else {
              absenceCounterRef.current = 0;
              const avgX = skinXSum / skinPixelCount;
              const centerX = canvas.width / 2;
              const offsetRatio = Math.abs(avgX - centerX) / (canvas.width / 2);

              // Condition C: Looking away / Head turned toward edge
              if (offsetRatio > 0.55) {
                gazeCounterRef.current += 1;
                setAiStatus("LOOKING_AWAY");
                setConfidence(62);

                if (gazeCounterRef.current >= 2) {
                  triggerViolation(
                    "LOOKING_AWAY",
                    "AI Alert: Gaze diversion detected: Candidate looking away from the examination screen."
                  );
                }
              } else {
                // Verified & Centered
                gazeCounterRef.current = 0;
                setAiStatus("VERIFIED");
                setConfidence(Math.min(99, Math.round(92 + Math.random() * 6)));
              }
            }
          } catch (err) {
            // Context read error fallback
          }
        }
      } else if (useSimulatedMode) {
        // Simulated Interactive Proctoring Telemetry
        if (simulationFaceState === "NO_FACE") {
          setAiStatus("NO_FACE");
          setConfidence(12);
          triggerViolation(
            "NO_FACE_DETECTED",
            "Simulated: Face absence detected for >5 seconds."
          );
        } else if (simulationFaceState === "AWAY") {
          setAiStatus("LOOKING_AWAY");
          setConfidence(58);
          triggerViolation(
            "LOOKING_AWAY",
            "Simulated: Gaze diversion & head turn detected."
          );
        } else {
          setAiStatus("VERIFIED");
          setConfidence(98);
        }
      }
    }, 2000);

    return () => clearInterval(analysisInterval);
  }, [cameraActive, useSimulatedMode, simulationFaceState, triggerViolation]);

  // 3. Tab Switches, Focus, and Fullscreen Security Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation(
          "TAB_SWITCH",
          "Student switched browser tabs or minimized the active exam window.",
          3
        );
      }
    };

    const handleWindowBlur = () => {
      // Debounce window blur to ensure it was a real navigation away
      setTimeout(() => {
        if (document.hidden || !document.hasFocus()) {
          triggerViolation(
            "TAB_SWITCH",
            "Student navigated away from active examination window.",
            4
          );
        }
      }, 400);
    };

    const handleFullscreenChange = () => {
      const isNowFs = !!document.fullscreenElement;
      setIsFullscreen(isNowFs);
      if (!isNowFs) {
        triggerViolation(
          "FULLSCREEN_EXIT",
          "Student exited required fullscreen security mode.",
          3
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [triggerViolation]);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Floating High-Priority Violation Toast */}
      {activeAlert && (
        <div className="fixed top-5 right-5 z-50 animate-bounce max-w-md bg-rose-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-rose-400 flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-300" />
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide uppercase text-xs text-amber-200">
                Security Flag Triggered
              </span>
              <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded font-mono">
                {activeAlert.type}
              </span>
            </div>
            <p className="font-medium mt-1 text-xs text-white leading-relaxed">
              {activeAlert.message}
            </p>
            <p className="text-[11px] text-rose-200 mt-1 font-semibold">
              Logged to Admin & Faculty Audit Trail (Violation #{violationCount})
            </p>
          </div>
        </div>
      )}

      {/* AI Proctoring Live HUD Widget */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl p-3.5 text-white">
        {/* Header telemetry badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Vision Proctor
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
              <span className="text-slate-400 text-[11px]">Flags:</span>
              <span className={violationCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                {violationCount}
              </span>
            </div>
          </div>
        </div>

        {/* Video Frame Viewport */}
        <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              !cameraActive ? "hidden" : ""
            }`}
          />

          {/* Fallback Display if camera is blocked/denied */}
          {!cameraActive && (
            <div className="text-center p-4 text-slate-400 flex flex-col items-center max-w-xs">
              <CameraOff className="w-8 h-8 mb-2 text-rose-400 animate-pulse" />
              <p className="text-xs font-medium text-slate-300 mb-2">
                {cameraError || "Camera feed disconnected."}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Retry WebCam
                </button>
                <button
                  onClick={() => {
                    setUseSimulatedMode(true);
                    setCameraActive(false);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition"
                >
                  <Scan className="w-3 h-3 text-emerald-400" /> Demo Simulator
                </button>
              </div>
            </div>
          )}

          {/* AI Face Detection Crosshairs & Bounding Box */}
          {(cameraActive || useSimulatedMode) && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3">
              {/* Dynamic Bounding Box with Color States */}
              <div
                className={`w-28 h-32 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-between p-1.5 ${
                  aiStatus === "VERIFIED"
                    ? "border-emerald-400/80 bg-emerald-500/5 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
                    : aiStatus === "LOOKING_AWAY"
                    ? "border-amber-400/90 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                    : "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse"
                }`}
              >
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wide uppercase transition ${
                    aiStatus === "VERIFIED"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : aiStatus === "LOOKING_AWAY"
                      ? "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                      : "bg-rose-950/80 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {aiStatus === "VERIFIED"
                    ? "FACE TRACKED"
                    : aiStatus === "LOOKING_AWAY"
                    ? "GAZE DIVERTER"
                    : "NO FACE DETECTED"}
                </span>

                <div className="w-full flex justify-between text-[8px] font-mono text-slate-400">
                  <span>AI: {confidence}%</span>
                  <span>30 FPS</span>
                </div>
              </div>

              {/* Bottom Telemetry Chip */}
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Active Tracking Live</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Telemetry Status Breakdown */}
        <div className="mt-3 space-y-2 text-xs">
          {/* Fullscreen status */}
          <div className="flex items-center justify-between text-slate-300 bg-slate-800/70 border border-slate-700/50 px-2.5 py-1.5 rounded-xl">
            <span className="flex items-center space-x-2">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-[11px]">Fullscreen Lock:</span>
            </span>
            {isFullscreen ? (
              <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secured
              </span>
            ) : (
              <button
                onClick={requestFullscreen}
                className="text-amber-400 font-bold text-[11px] underline hover:text-amber-300 flex items-center gap-1"
              >
                Re-enter Fullscreen
              </button>
            )}
          </div>

          {/* Tab switch / Focus status */}
          <div className="flex items-center justify-between text-slate-300 bg-slate-800/70 border border-slate-700/50 px-2.5 py-1.5 rounded-xl">
            <span className="flex items-center space-x-2">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-[11px]">Focus & Tab Monitor:</span>
            </span>
            <span className="text-emerald-400 font-semibold text-[11px]">Enforced</span>
          </div>

          {/* Interactive AI Simulation & Instant Violation Triggers for Testing */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Instant Violation Triggers
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSimulationFaceState("NO_FACE");
                  setAiStatus("NO_FACE");
                  setConfidence(10);
                  triggerViolation(
                    "NO_FACE_DETECTED",
                    "Simulated: Student face left webcam frame for >5 seconds.",
                    0
                  );
                }}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-rose-300 py-1.5 px-2 rounded-lg transition border border-slate-700 text-center active:scale-95"
              >
                Face Loss
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulationFaceState("AWAY");
                  setAiStatus("LOOKING_AWAY");
                  setConfidence(55);
                  triggerViolation(
                    "LOOKING_AWAY",
                    "Simulated: Continuous gaze diversion away from exam screen.",
                    0
                  );
                }}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-amber-300 py-1.5 px-2 rounded-lg transition border border-slate-700 text-center active:scale-95"
              >
                Gaze Diversion
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerViolation(
                    "TAB_SWITCH",
                    "Simulated: Student switched browser tab or opened background window.",
                    0
                  );
                }}
                className="bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-purple-300 py-1.5 px-2 rounded-lg transition border border-slate-700 text-center active:scale-95"
              >
                Tab Switch
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};