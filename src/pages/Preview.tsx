import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import InstructionStepper from "../components/InstructionStepper";
import PlaceholderImg from "../assets/instruction-default.png";

const API_URL = import.meta.env.VITE_API_URL;
const RUNPOD_URL = import.meta.env.VITE_RUNPOD_URL;
const RUNPOD_API_KEY = import.meta.env.VITE_RUNPOD_API_KEY;
const USE_RUNPOD = import.meta.env.VITE_USE_RUNPOD === "true";

// Detector type: "claude" or "siamese"
// - claude: Uses Claude Vision API (better accuracy, handles different angles)
// - siamese: Uses local Siamese network (faster, no API cost, needs consistent angles)

const DETECTOR_TYPE: "claude" | "siamese" = "claude";

type PreviewState = { stepId: number; imageSrc: string; tutorialId?: string };

export default function PreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState | null;

  const totalSteps = 5;

  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const title = useMemo(() => "Check Your Photo", []);
  const description = useMemo(
    () => "Confirm the photo looks clear, then tap Verify to check your step.",
    []
  );

  const handleBack = () => {
    navigate("/camera-step-completion");
  }

  if (!state) {
    return (
      <div className="min-h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-10">
        <div className="max-w-[420px] mx-auto">
          <p className="text-gray-700">No photo found. Go back and take a picture.</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 w-full py-3 rounded-xl bg-black text-white font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const { stepId, imageSrc, tutorialId = "treehacks" } = state;

  const verify = async () => {
    setError("");
    setLoading(true);
    setMatch(null);
    setFeedback("");

    try {
      let data: any;

      if (USE_RUNPOD && RUNPOD_URL) {
        const base64Data = imageSrc.split(",")[1];

        const response = await fetch(RUNPOD_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RUNPOD_API_KEY}`,
          },
          body: JSON.stringify({
            input: { image_base64: base64Data, step_id: stepId, tutorial_id: tutorialId },
          }),
        });

        if (!response.ok) throw new Error(`RunPod API error: ${response.status}`);
        const result = await response.json();
        data = result.output || result;
      } else {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

        const form = new FormData();
        form.append("image", file);
        form.append("stepId", String(stepId));
        form.append("detector_type", DETECTOR_TYPE);
        form.append("tutorial_id", tutorialId);

        const response = await fetch(`${API_URL}/verify/verify-step`, {
          method: "POST",
          body: form,
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        data = await response.json();
      }

      setMatch(!!data.match);
      setFeedback(data.feedback ?? "");

      if ("speechSynthesis" in window && data.feedback) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.feedback));
      }
    } catch {
      setError("Verify failed. Check API URL / HTTPS / CORS.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => navigate(-1);

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-10">
      <PageHeader onBack={handleBack} />

      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <InstructionStepper steps={totalSteps} activeStep={stepId - 1} />

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Step {stepId} of {totalSteps}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{title}</h2>
              <p className="mt-2 text-sm text-gray-600">{description}</p>
            </div>

            {match !== null && (
              <div
                className={`shrink-0 px-3 py-2 rounded-lg text-white font-bold text-sm ${
                  match ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {match ? "TRUE" : "FALSE"}
              </div>
            )}
          </div>

          {/* Two tiles */}
          <div className="flex gap-3 w-full">
            <div className="flex-1 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-100 aspect-square">
              <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 aspect-square">
              <img
                src={PlaceholderImg}
                alt="Placeholder"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>

          {/* Backend feedback */}
          {feedback && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              {feedback}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-4 rounded-xl
                         bg-white border-2 border-gray-300 text-gray-800 font-medium text-sm
                         shadow-md hover:shadow-lg active:scale-95 transition"
            >
              Retake photo
            </button>

            <button
              type="button"
              onClick={verify}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-xl
                         font-medium text-sm shadow-lg active:scale-95 transition
                         ${
                           loading
                             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                             : "bg-[#AF69EE] text-white hover:shadow-xl hover:brightness-110"
                         }`}
            >
              {loading ? "Verifying…" : "Verify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
