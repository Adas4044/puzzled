import InstructionStepper from "../components/InstructionStepper";
import PageHeader from "../components/PageHeader";


interface InstructionProps {
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Instruction({language, setLanguage}: InstructionProps) {
  return (
    <div>
      <PageHeader backTo="preview" language={language} setLanguage={setLanguage} />
      <InstructionStepper steps={5} activeStep={1} />
    </div>
  )
}