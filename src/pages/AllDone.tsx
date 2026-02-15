import { HomeIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function Verified() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF] 
                    px-6 flex flex-col items-center justify-center 
                    text-center">

      {/* Icon */}
      <div className="h-24 w-24 rounded-3xl bg-[#EFE6FF] 
                      flex items-center justify-center mb-8">
        <SparklesIcon className="h-12 w-12 text-[#AF69EE]" />
      </div>

      {/* Text */}
      <p className="text-xs text-gray-500 uppercase tracking-widest">
        Tutorial complete
      </p>

      <h2 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">
       All steps completed!
      </h2>

      {/* Button */}
      <button
        type="button"
        onClick={() => navigate("/tutorial")}
        className="mt-10 inline-flex items-center gap-2 
                   bg-[#AF69EE] text-white 
                   px-8 py-4 rounded-2xl 
                   text-base font-medium 
                   transition hover:brightness-110 active:scale-95 shadow-md"
      >
        <HomeIcon className="h-5 w-5" />
        Back to Home
      </button>

    </div>
  );
}
