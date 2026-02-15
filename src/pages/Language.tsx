import LanguageSelector from "../components/LanguageSelector";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Language() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('language');

  return (
    <div className="min-h-screen flex flex-col justify-center w-full px-6 pt-10 gap-8">
      <h2 className="text-3xl font-bold text-gray-700 text-center">
        {t('title')}
      </h2>
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        <LanguageSelector
          align="center"
          value={i18n.language}
          onChange={(lng) => i18n.changeLanguage(lng)}
        />
        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 bg-[#AF69EE] text-white px-5 py-3 rounded-xl transition active:scale-95"
          onClick={() => navigate("/tutorial")}>
            <ArrowRightIcon className="w-5 h-5 stroke-2" />
          </button>
        </div>
      </div>
      <button></button>
    </div>
  );
}