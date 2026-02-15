import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface VerifiedProps {
  activeStep: number;
  totalSteps: number;
}

export default function Verified({ activeStep, totalSteps }: VerifiedProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/instruction");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

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
