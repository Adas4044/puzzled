import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { fetchAllTutorials } from "../services/tutorialService";
import { ApiError } from "../services/api";
import type { Tutorial as TutorialType } from "../types/database";

interface TutorialProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Tutorial({language, setLanguage}: TutorialProps) {
  const navigate = useNavigate();

  // State management
  const [tutorials, setTutorials] = useState<TutorialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutorials on component mount
  useEffect(() => {
    async function loadTutorials() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllTutorials();
        setTutorials(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
        console.error('Error loading tutorials:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTutorials();
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full px-6 pt-10 gap-8 bg-[#F5F5F5]">
      <PageHeader backTo="/" language={language} setLanguage={setLanguage}/>
      <h2 className="text-3xl font-bold text-gray-700 text-center">
        Select Tutorial
      </h2>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF69EE]"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800 font-medium">Failed to load tutorials</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success state - Tutorial grid */}
      {!loading && !error && (
        <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2">
          {tutorials.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-500 text-lg">No tutorials available yet</p>
            </div>
          ) : (
            tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition hover:shadow-xl hover:-translate-y-1"
              >
                <div className="h-56 w-full overflow-hidden bg-gray-200">
                  {tutorial.photoUrl ? (
                    <img
                      src={tutorial.photoUrl}
                      alt={tutorial.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = '/placeholder-tutorial.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {tutorial.title}
                    </h3>
                    {tutorial.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {tutorial.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/steps/${tutorial.id}`)}
                    className="bg-[#AF69EE] text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:brightness-110 active:scale-95 whitespace-nowrap"
                  >
                    Start Tutorial
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
