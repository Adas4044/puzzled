type TutorialStepperProps = {
  steps: number;
  activeStep: number;
};

export default function InstructionStepper({ steps, activeStep }: TutorialStepperProps) {
  const clamped = Math.max(0, Math.min(activeStep, steps - 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full min-w-0">
        {Array.from({ length: steps }).map((_, i) => {
          const done = i < clamped;
          const current = i === clamped;

          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              {/* dot: always same outer size */}
              <div
                className={[
                  "w-4 h-4 shrink-0 rounded-full flex items-center justify-center",
                  current ? "border-2 border-[#AF69EE] bg-white" : "border-2 border-transparent",
                ].join(" ")}
                aria-current={current ? "step" : undefined}
              >
                <div
                  className={[
                    "w-2.5 h-2.5 rounded-full",
                    done ? "bg-[#AF69EE]" : current ? "bg-white" : "bg-gray-300",
                  ].join(" ")}
                />
              </div>

              {/* connector: flexible so it never overflows */}
              {i < steps - 1 && (
                <div
                  className={[
                    "mx-2 h-[2px] flex-1",
                    i < clamped ? "bg-[#AF69EE]" : "bg-gray-300",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
