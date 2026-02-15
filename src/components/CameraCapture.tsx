import { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";

type Props = {
  stepId: number;
  onCaptured: (imageSrc: string) => void;
};

export default function CameraCapture({ onCaptured }: Props) {
  const webcamRef = useRef<Webcam>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  const videoConstraints = useMemo(
    () => ({
      facingMode: { ideal: "environment" }, // back camera
      width: { ideal: 1280 },
      height: { ideal: 720 },
    }),
    []
  );

  const captureOnly = () => {
    setError("");
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError("Could not capture image. Make sure the camera is running.");
      return;
    }

    // pass captured image up to CameraPage > navigate to Preview
    onCaptured(imageSrc);
  };

  return (
    <div style={{ textAlign: "center" }}>
      {!cameraOn ? (
        <button
          onClick={() => setCameraOn(true)}
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            fontSize: 16,
            width: "100%",
          }}
        >
          Take Picture
        </button>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            playsInline
            style={{ width: "100%", borderRadius: 12 }}
          />

          <button
            onClick={captureOnly}
            style={{
              marginTop: 12,
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              fontSize: 16,
              width: "100%",
              cursor: "pointer",
            }}
          >
            Capture
          </button>

          <button
            onClick={() => {
              setCameraOn(false);
              setError("");
            }}
            style={{
              marginTop: 10,
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #ddd",
              backgroundColor: "black",
              fontSize: 14,
              width: "100%",
              color: "white",
            }}
          >
            Cancel
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
