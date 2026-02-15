import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Analyzing() {
  const navigate = useNavigate();

  // THIS IS PLACEHOLDER UNTIL WE IMPLEMENT ACTUAL ANALYSIS
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/verified");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);


  return (
    <div className="h-[100dvh] w-full bg-[#F8F5FF] flex flex-col items-center justify-center gap-6 px-6 text-center">
      
      <ArrowPathIcon className="w-12 h-12 text-[#AF69EE] stroke-2 animate-spin" />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Analyzing...
        </h2>
        <p className="text-sm text-gray-600">
          Verifying your work. Please hold still.
        </p>
      </div>

    </div>
  );
}
