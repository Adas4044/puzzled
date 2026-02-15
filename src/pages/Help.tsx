import PageHeader from "../components/PageHeader";
import InstructionStepper from "../components/InstructionStepper";
import { HelpButton } from "../components/HelpButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();
  const totalSteps = 5;
  const [stepNumber] = useState(2);
  const { t } = useTranslation(['instruction', 'common', 'help']);

  const handleBack = () => {
    navigate("/instruction");
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F5FF] px-6 pt-10 pb-10">
      <PageHeader onBack={handleBack} />

      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <InstructionStepper steps={totalSteps} activeStep={stepNumber - 1} />

          <div className="space-y-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">
        {t('instruction:stepLabel', { number: stepNumber, total: totalSteps })}
      </p>

      <h2 className="text-2xl font-bold text-gray-900">
        {t('help:heading')}
      </h2>

      <p className="text-sm text-gray-600 leading-relaxed">
        {t('help:description')}
      </p>

      {/* Status Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#AF69EE]/20 bg-[#AF69EE]/5 p-4">
        <span className="relative flex h-3 w-3 mt-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {t('help:technicianStatus')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('help:responseTime')}
          </p>
        </div>
      </div>
    </div>

          {/* Soft callout box */}
          <div className="rounded-2xl border border-[#AF69EE]/20 bg-[#AF69EE]/5 p-4">
            <div className="flex gap-3">
              <div className="mt-0.5">
                <ShieldCheckIcon className="h-5 w-5 text-[#AF69EE]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t('help:securityTitle')}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {t('help:zoomDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-1">
            <HelpButton />
          </div>

          {/* Tiny footer hint */}
          <p className="text-xs text-gray-400 text-center pt-1">
            {t('help:popupBlockerHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
