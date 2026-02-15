import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

type Props = {
  backTo: string;
  language: string;
  setLanguage: (code: string) => void;
  align?: "right" | "center"; // optional if you want to control dropdown align
};

export default function PageHeader({
  backTo,
  language,
  setLanguage,
  align = "right",
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="w-30">
        <LanguageSelector
          align={align}
          value={language}
          onChange={setLanguage}
        />
      </div>
    </div>
  );
}
