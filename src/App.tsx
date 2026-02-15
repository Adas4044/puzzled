import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Analyzing from "./pages/Analyzing";
import CameraStepCompletion from "./pages/CameraStepCompletion";
import Instruction from "./pages/Instruction";
import Language from "./pages/Language";
import Preview from "./pages/Preview";
import SetupCamera from "./pages/SetupCamera";
import Tutorial from "./pages/Tutorial";
import Verified from "./pages/Verified";
import Zoom from "./pages/Zoom";
import Help from "./pages/Help";

function App() {
  const [language, setLanguage] = useState<string>("en");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Language language={language} setLanguage={setLanguage} />} />
        <Route path="/tutorial" element={<Tutorial language={language} setLanguage={setLanguage} />} />
        <Route path="/camerasetup" element={<SetupCamera language={language} setLanguage={setLanguage}/>} />
        <Route path="/instruction" element={<Instruction language={language} setLanguage={setLanguage}/>} />
        <Route path="/camera-step-completion" element={<CameraStepCompletion language={language} setLanguage={setLanguage} />} />
        <Route path="/preview" element={<Preview language={language} setLanguage={setLanguage} />} />
        <Route path="/zoom" element={<Zoom />} />
        <Route path="/analyzing" element={<Analyzing/>} />
        <Route path="/verified" element={<Verified activeStep={1} totalSteps={5}/>} />
        <Route path="/help" element={<Help language={language} setLanguage={setLanguage}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
