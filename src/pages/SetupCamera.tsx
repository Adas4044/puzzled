/**
 * Setup Your Camera — first-time screen.
 * Uses react-webcam to request permission + show preview.
 * "Start" proceeds to /camera.
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const SETUP_DONE_KEY = "puzzled_camera_setup_done";

export default function SetupCameraPage() {
  const navigate = useNavigate();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState("");

  // iPhone/Safari friendly constraints
  const videoConstraints = useMemo(
    () => ({
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    }),
    []
  );

  const handleStart = () => {
    if (!permissionGranted) return;

    try {
      localStorage.setItem(SETUP_DONE_KEY, "true");
    } catch {}

    navigate("/camera", { replace: true });
  };

  return (
    
    <div className="min-h-screen max-w-[420px] mx-auto px-6 py-8 flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Setup Your Camera</h1>

      {/* Real camera preview */}
      <div className="w-full aspect-[4/3] rounded-2xl border-4 border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center text-gray-500 mb-6">
        <Webcam
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          playsInline
          onUserMedia={() => {
            setPermissionGranted(true);
            setError("");
          }}
          onUserMediaError={() => {
            setPermissionGranted(false);
            setError("Camera access is required. Please allow camera permissions.");
          }}
          className="w-full h-full object-cover"
        />
      </div>

      <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
        <li>Top down angle</li>
        <li>Stable</li>
        <li>Good consistent lighting</li>
      </ul>

      {error && (
        <div className="text-red-600 text-sm mb-4">
          {error}
          <div className="text-gray-600 mt-1">
            If you already denied permission, enable it in your browser/site settings and refresh.
          </div>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={!permissionGranted}
          className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
            permissionGranted
              ? "bg-black text-white active:scale-[0.98]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Start
        </button>
      </div>
    </div>
  );
}
