import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Webcam from "react-webcam";
import PageHeader from "../components/PageHeader";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const SETUP_DONE_KEY = "puzzled_camera_setup_done";

export default function SetupCameraPage() {
  const navigate = useNavigate();
  const { tutorialId } = useParams();
  const { t } = useTranslation(['camera', 'common']);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState("");

  const videoConstraints = useMemo(
    () => ({
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    }),
    []
  );

  const handleStart = () => {
    if (!permissionGranted) return;

    try {
      localStorage.setItem(SETUP_DONE_KEY, "true");
    } catch {}

    navigate(`/instruction/${tutorialId}`);
  };

  const handleBack = () => {
    navigate(`/tutorial`);
  }

  return (
    <div className="h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-6 overflow-hidden flex flex-col">
      <PageHeader onBack={handleBack} />

      <div className="mt-6 max-w-3xl w-full mx-auto flex-1 min-h-0">
        {/* Main card wrapper */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 h-full flex flex-col min-h-0">
          {/* Top text */}
          <div className="shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('camera:setup.title')}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{t('camera:setup.heading')}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {t('camera:setup.description')}
            </p>
          </div>

          {/* Webcam gets remaining space */}
          <div className="mt-4 flex-1 min-h-0 rounded-2xl border border-gray-300 bg-gray-100 overflow-hidden">
            <Webcam
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              playsInline
              onUserMedia={() => {
                setPermissionGranted(true);
                setError("");
              }}
              onUserMediaError={() => {
                setPermissionGranted(false);
                setError(t('camera:setup.errors.permissionDenied'));
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tips + error */}
          <div className="mt-4 grid gap-3 shrink-0">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">{t('camera:setup.tips.title')}</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>{t('camera:setup.tips.topDown')}</li>
                <li>{t('camera:setup.tips.stable')}</li>
                <li>{t('camera:setup.tips.lighting')}</li>
              </ul>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {t('camera:setup.errors.permissionHelp')}
                </p>
              </div>
            )}
          </div>

          {/* CTA pinned to bottom */}
          <div className="mt-4 shrink-0">
            <button
              onClick={handleStart}
              disabled={!permissionGranted}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm
                shadow-lg transition-transform transition-shadow duration-200
                active:scale-95
                ${
                  permissionGranted
                    ? "bg-[#AF69EE] text-white hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                }`}
            >
              {t('common:buttons.start')}
              <ArrowRightIcon className="w-5 h-5 stroke-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
