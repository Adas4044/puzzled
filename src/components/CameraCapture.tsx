import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";

export type CameraCaptureHandle = {
  capture: () => void;
  isReady: () => boolean;
};

type Props = {
  stepId: number;
  onCaptured: (imageSrc: string) => void;
  onReadyChange?: (ready: boolean) => void; 
};

const CameraCapture = forwardRef<CameraCaptureHandle, Props>(
  ({ onCaptured, onReadyChange }, ref) => {
    const webcamRef = useRef<Webcam>(null);

    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);

    const videoConstraints = useMemo(
      () => ({
        facingMode: { ideal: "environment" },
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

      onCaptured(imageSrc);
    };

    useImperativeHandle(ref, () => ({
      capture: captureOnly,
      isReady: () => ready,
    }));

    return (
      <div className="w-full">
        <div className="relative w-full rounded-xl border border-gray-300 overflow-hidden bg-gray-100">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            playsInline
            onUserMedia={() => {
              setReady(true);
              onReadyChange?.(true);
              setError("");
            }}
            onUserMediaError={() => {
              setReady(false);
              onReadyChange?.(false);
              setError("Camera access denied. Please allow permissions and try again.");
            }}
            className="w-full aspect-[4/3] object-cover"
          />

          {!ready && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white font-semibold">
              Starting camera...
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

CameraCapture.displayName = "CameraCapture";
export default CameraCapture;
