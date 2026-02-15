import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface VerifiedProps {
  activeStep: number;
  totalSteps: number;
}

type VerifiedState = {
  activeStep?: number;
  totalSteps?: number;
  nextStepNumber?: number;
  tutorialId?: string;
} | null;

export default function Verified({ activeStep: propStep, totalSteps: propTotal }: VerifiedProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as VerifiedState;

  const activeStep = state?.activeStep ?? propStep;
  const totalSteps = state?.totalSteps ?? propTotal;
  const nextStepNumber = state?.nextStepNumber ?? activeStep;
  const tutorialId = state?.tutorialId ?? "treehacks";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (nextStepNumber > totalSteps) {
        navigate("/alldone");
      } else {
        navigate("/instruction", { state: { stepNumber: nextStepNumber, tutorialId } });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, nextStepNumber, totalSteps, tutorialId]);

  return (
    <div className="h-[100dvh] w-full bg-[#F8F5FF] flex flex-col items-center justify-center gap-6 px-6 text-center">
      
      <CheckCircleIcon className="w-14 h-14 text-[#AF69EE] stroke-2" />

      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Step {activeStep} of {totalSteps}
        </p>

        <h2 className="text-2xl font-bold text-gray-900">
          Step verified
        </h2>

        <p className="text-sm text-gray-600">
          Moving to the next step...
        </p>
      </div>

    </div>
  );
}
