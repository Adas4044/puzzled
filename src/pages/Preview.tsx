import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const RUNPOD_URL = import.meta.env.VITE_RUNPOD_URL;
const RUNPOD_API_KEY = import.meta.env.VITE_RUNPOD_API_KEY;
const USE_RUNPOD = import.meta.env.VITE_USE_RUNPOD === "true";

// Detector type: "claude" or "siamese"
// - claude: Uses Claude Vision API (better accuracy, handles different angles)
// - siamese: Uses local Siamese network (faster, no API cost, needs consistent angles)
const DETECTOR_TYPE: "claude" | "siamese" = "claude";

export default function PreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { stepId: number; imageSrc: string } | null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [match, setMatch] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  if (!state) {
    return (
      <div style={{ maxWidth: 420, margin: "24px auto", padding: 16 }}>
        <p>No photo found. Go back and take a picture.</p>
        <button onClick={() => navigate("/")}>Back</button>
      </div>
    );
  }

  const { stepId, imageSrc } = state;

  const verify = async () => {
    setError("");
    setLoading(true);

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
            input: { image_base64: base64Data, step_id: stepId },
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

        const response = await fetch(`${API_URL}/verify/verify-step`, {
          method: "POST",
          body: form,
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        data = await response.json();
      }

      setFeedback(data.feedback ?? "");
      setMatch(!!data.match);

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

  const handleSave = () => {
    setShowSuccess(true);
  };

  return (
    <div style={{ maxWidth: 420, margin: "24px auto", padding: 16, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Preview Step {stepId}</h2>
        {match !== null && (
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              backgroundColor: match ? "#28a745" : "#dc3545",
              color: "white",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {match ? "TRUE" : "FALSE"}
          </div>
        )}
      </div>

      {showSuccess && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 16,
            right: 16,
            padding: 12,
            borderRadius: 10,
            backgroundColor: "#e9fbe9",
            border: "1px solid #b7f0b7",
            color: "#145214",
            fontWeight: 600,
            textAlign: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          ✅ Saved successfully!
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <img src={imageSrc} alt="Preview" style={{ width: "100%", borderRadius: 12 }} />
      </div>


      {feedback && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "#f3f3f3" }}>
          {feedback}
        </div>
      )}

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      {loading && <p style={{ marginTop: 10 }}>Verifying...</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
            backgroundColor: "#000",
            color: "white",
          }}
        >
          Retake
        </button>

        <button
          onClick={verify}
          disabled={loading}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            backgroundColor: loading ? "#6c757d" : "#17a2b8",
            color: "white",
            fontWeight: 600,
          }}
        >
          Verify
        </button>

        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            fontWeight: 600,
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
