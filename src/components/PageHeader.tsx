import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

type Props = {
  backTo: string;
  align?: "right" | "center"; // optional if you want to control dropdown align
};

export default function PageHeader({
  backTo,
  align = "right",
}: Props) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');

  return (
    <div className="flex items-center justify-between z-[9999]">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeftIcon className="w-5 h-5 stroke-2" />
        <span className="text-sm font-medium">{t('buttons.back')}</span>
      </button>

      <div className="w-30">
        <LanguageSelector
          align={align}
          value={i18n.language}
          onChange={(lng) => i18n.changeLanguage(lng)}
        />
      </div>
    </div>
  );
}
