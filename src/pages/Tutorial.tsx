import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/PageHeader";
import { fetchAllTutorials } from "../services/tutorialService";
import { ApiError } from "../services/api";
import { translateTutorials } from "../utils/translateContent";
import type { Tutorial as TutorialType } from "../types/database";

export default function Tutorial() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['tutorial', 'common', 'errors']);

  const [tutorials, setTutorials] = useState<TutorialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutorials on component mount and when language changes
  useEffect(() => {
    async function loadTutorials() {
      try {
        setLoading(true);
        setError(null);

        // Fetch tutorials from database (English)
        const data = await fetchAllTutorials();

        // Translate if not English (uses cache when available)
        const translatedData = await translateTutorials(data, i18n.language);

        setTutorials(translatedData);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(t('errors:unexpected'));
        }
        console.error('Error loading tutorials:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTutorials();
  }, [i18n.language, t]);

  const handleRetry = () => window.location.reload();
  const handleBack = () => {
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col w-full px-6 py-10 gap-8">
      <PageHeader onBack={handleBack} />
      <h2 className="text-3xl font-bold text-gray-700 text-center">
        {t('tutorial:title')}
      </h2>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF69EE]" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
            <p className="text-gray-900 font-semibold">{t('tutorial:errors.failedToLoad')}</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center justify-center bg-[#AF69EE] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition hover:brightness-110 active:scale-95"
            >
              {t('common:buttons.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {!loading && !error && (
        <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2">
          {tutorials.length === 0 ? (
            <div className="sm:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-gray-900 font-semibold">{t('tutorial:noTutorials')}</p>
                <p className="text-gray-600 text-sm mt-1">Check back soon.</p>
              </div>
            </div>
          ) : (
            tutorials.map((tutorial, idx) => (
              <div
                key={tutorial.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden transform-gpu transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-[fadeUp_.35s_ease-out_both]"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="h-70 w-full overflow-hidden bg-gray-200">
                  {tutorial.photoUrl ? (
                    <img
                      src={tutorial.photoUrl}
                      alt={tutorial.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-tutorial.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">{t('common:noImage')}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-gray-200 flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-gray-700 leading-tight">
                    {tutorial.title}
                  </h3>

                  {tutorial.description && (
                    <p className="text-sm text-gray-500 leading-snug line-clamp-3">
                      {tutorial.description}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      navigate(`/camerasetup/${tutorial.id}`);
                    }}
                    className="w-full bg-[#AF69EE] text-white px-4 py-2 rounded-xl text-sm font-medium transition active:scale-95"
                  >
                    {t('tutorial:startTutorial')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Local keyframes for card entrance */}
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
