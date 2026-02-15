import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Camera from "./pages/Camera";
import Preview from "./pages/Preview";
import Language from "./pages/Language";
import Tutorial from "./pages/Tutorial";
import Zoom from "./pages/Zoom";
import Instruction from "./pages/Instruction";

function App() {
  const [language, setLanguage] = useState<string>("en");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/camera" element={<Camera />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/" element={<Language language={language} setLanguage={setLanguage} />} />
        <Route path="/tutorial" element={<Tutorial language={language} setLanguage={setLanguage} />} />
        <Route path="/zoom" element={<Zoom />} />
        <Route path="/instruction" element={<Instruction language={language} setLanguage={setLanguage}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;