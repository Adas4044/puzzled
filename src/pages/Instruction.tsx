import InstructionStepper from "../components/InstructionStepper";
import PageHeader from "../components/PageHeader";
import InstructionDefaultImg from "../assets/instruction-default.png";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { CameraIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function Instruction() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { tutorialId?: string } | null;
  const tutorialId = state?.tutorialId ?? "treehacks";
  const { t } = useTranslation(['instruction', 'common']);

  const totalSteps = 5;
  const [stepNumber] = useState(1);

  const handleStepComplete = () => {
    // send the step id and tutorial id to the camera completion page
    navigate("/camera-step-completion", { state: { stepId: stepNumber, tutorialId } });
  };

  const handleLiveHelp = () => {
    navigate("/help");
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-10">
      <PageHeader backTo="/camerasetup" />

      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <InstructionStepper steps={totalSteps} activeStep={stepNumber - 1} />

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t('instruction:stepLabel', { number: stepNumber, total: totalSteps })}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Attach the drill bit to the handpiece
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Align the bit, insert fully, and confirm it locks in place before continuing.
            </p>

            <p className="mt-2 text-sm text-gray-600">
              <Trans
                i18nKey="instruction:completionHint"
                components={{ strong: <span className="font-medium text-[#AF69EE]" /> }}
              />
            </p>
          </div>

          <div className="mt-4">
            <img
              src={InstructionDefaultImg}
              alt={`Step ${stepNumber}`}
              className="w-full rounded-xl border border-gray-300"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleStepComplete}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                         bg-[#AF69EE] text-white font-medium text-sm
                         shadow-lg transition-transform transition-shadow duration-200
                         hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110
                         active:translate-y-0 active:scale-95"
            >
              <CameraIcon className="w-5 h-5 stroke-2" />
              {t('instruction:stepComplete')}
            </button>

            <button
              type="button"
              onClick={handleLiveHelp}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                         bg-white border-2 border-[#AF69EE] text-[#AF69EE] font-medium text-sm
                         shadow-md transition-transform transition-shadow duration-200
                         hover:shadow-lg hover:-translate-y-0.5 hover:bg-[#AF69EE]/10
                         active:translate-y-0 active:scale-95"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 stroke-2" />
              {t('instruction:getLiveHelp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
