/**
 * HelpButton Component
 * Button to create and join a Zoom help meeting
 */

import { useState } from "react";
import { createHelpMeeting, ApiError } from "../services/api";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function HelpButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHelpRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createHelpMeeting();
      window.open(response.joinUrl, "_blank", "noopener,noreferrer");
      console.log("Meeting created:", response.meetingId);
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.statusCode === 503) {
        setError("Service temporarily unavailable. Please try again.");
      } else if (apiError.statusCode >= 500) {
        setError("Server error. Please contact support.");
      } else if (apiError.statusCode === 0) {
        setError("Network error. Check your connection and try again.");
      } else {
        setError(apiError.detail || "Failed to create meeting. Please try again.");
      }

      console.error("Help request error:", apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleHelpRequest}
        disabled={isLoading}
        aria-label="Request help"
        className={`
          w-full flex items-center justify-center gap-2
          py-3 px-4 rounded-xl
          font-medium text-sm
          text-white
          shadow-lg
          transition-all duration-200
          ${isLoading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-[#AF69EE] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-95"
          }
        `}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Creating Meeting...
          </>
        ) : (
          <>
            <QuestionMarkCircleIcon className="w-5 h-5 stroke-2" />
            Get Live Help
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="
            mt-3 p-3 rounded-lg
            text-sm
            border border-red-400
            bg-red-50
            text-red-600
          "
        >
          {error}
        </div>
      )}
    </div>
  );
}
