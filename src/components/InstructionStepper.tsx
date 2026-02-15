type TutorialStepperProps = {
  steps: number;
  activeStep: number;
};

export default function TutorialStepper({ steps, activeStep }: TutorialStepperProps) {
  const clamped = Math.max(0, Math.min(activeStep, steps - 1));

  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center justify-center">
        {Array.from({ length: steps }).map((_, i) => {
          const done = i < clamped;
          const current = i === clamped;

          return (
            <div key={i} className="flex items-center">
              {/* dot */}
              <div
                className={[
                  "w-3 h-3 rounded-full",
                  done
                    ? "bg-[#AF69EE]"
                    : current
                    ? "bg-white border-2 border-[#AF69EE]"
                    : "bg-gray-300",
                ].join(" ")}
                aria-current={current ? "step" : undefined}
              />

              {i < steps - 1 && (
                <div
                  className={`w-12 h-[2px] ${
                    i < clamped ? "bg-[#AF69EE]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}