import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import InstructionStepper from "../components/InstructionStepper";
import CameraCapture from "../components/CameraCapture";
import type { CameraCaptureHandle } from "../components/CameraCapture";
import { CameraIcon } from "@heroicons/react/24/outline";

interface CameraStepCompletionProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export default function CameraStepCompletionPage({ language, setLanguage }: CameraStepCompletionProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { stepId?: number; tutorialId?: string } | null;
  const stepId = state?.stepId ?? 1;
  const tutorialId = state?.tutorialId ?? "treehacks";

  const totalSteps = 5;

  const title = useMemo(() => "Take a photo", []);
  const description = useMemo(
    () => "Hold the camera steady and take a clear photo so we can verify this step.",
    []
  );

  const cameraRef = useRef<CameraCaptureHandle>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const handleCaptured = (imageSrc: string) => {
    navigate("/preview", { state: { stepId, imageSrc, tutorialId } });
  };

  const handleShutter = () => {
    cameraRef.current?.capture();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-10">
      <PageHeader backTo="/instruction" language={language} setLanguage={setLanguage} />

      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <InstructionStepper steps={totalSteps} activeStep={stepId - 1} />

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Step {stepId} of {totalSteps}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
            <p className="mt-2 text-sm text-gray-600">Tap the button to take a picture.</p>
          </div>

          <CameraCapture
            ref={cameraRef}
            stepId={stepId}
            onCaptured={handleCaptured}
            onReadyChange={setCameraReady}
          />

          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={handleShutter}
              disabled={!cameraReady}
              className={`h-16 w-16 rounded-full flex items-center justify-center
                          shadow-lg transition active:scale-95
                          ${!cameraReady ? "bg-gray-300 cursor-not-allowed" : "bg-white border-4 border-[#AF69EE]"}`}
              aria-label="Take picture"
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center
                            ${!cameraReady ? "bg-gray-400" : "bg-[#AF69EE]"}`}
              >
                <CameraIcon className="h-6 w-6 text-white" />
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
