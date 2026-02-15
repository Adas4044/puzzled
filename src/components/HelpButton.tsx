/**
 * HelpButton Component
 * Button to create and join a Zoom help meeting
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createHelpMeeting, ApiError } from "../services/api";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function HelpButton() {
  const { t } = useTranslation('errors');
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
        setError(t('serviceUnavailable'));
      } else if (apiError.statusCode >= 500) {
        setError(t('serverError'));
      } else if (apiError.statusCode === 0) {
        setError(t('network'));
      } else {
        setError(apiError.detail || t('apiError'));
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
        aria-label={t('requestHelp')}
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
            {t('creatingMeeting')}
          </>
        ) : (
          <>
            <QuestionMarkCircleIcon className="w-5 h-5 stroke-2" />
            {t('getLiveHelp')}
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
