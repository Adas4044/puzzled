import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Camera from "./pages/Camera";
import SetupCamera from "./pages/SetupCamera";
import Preview from "./pages/Preview";
import Language from "./pages/Language";
import Tutorial from "./pages/Tutorial";
import Zoom from "./pages/Zoom";
import Instruction from "./pages/Instruction";
import Analyzing from "./pages/Analyzing";
import Verified from "./pages/Verified";

function App() {
  const [language, setLanguage] = useState<string>("en");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Language language={language} setLanguage={setLanguage} />} />
        <Route path="/tutorial" element={<Tutorial language={language} setLanguage={setLanguage} />} />
        <Route path="/camerasetup" element={<SetupCamera language={language} setLanguage={setLanguage}/>} />
        <Route path="/instruction" element={<Instruction language={language} setLanguage={setLanguage}/>} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/zoom" element={<Zoom />} />
        <Route path="/analyzing" element={<Analyzing/>} />
        <Route path="/verified" element={<Verified activeStep={1} totalSteps={5}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;