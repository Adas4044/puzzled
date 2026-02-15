import { BrowserRouter, Routes, Route } from "react-router-dom";
import Analyzing from "./pages/Analyzing";
import CameraStepCompletion from "./pages/CameraStepCompletion";
import Instruction from "./pages/Instruction";
import Landing from "./pages/Landing.tsx";
import Language from "./pages/Language";
import Preview from "./pages/Preview";
import SetupCamera from "./pages/SetupCamera";
import Tutorial from "./pages/Tutorial";
import Verified from "./pages/Verified";
import Zoom from "./pages/Zoom";
import Help from "./pages/Help";
import AllDone from "./pages/AllDone";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/language" element={<Language />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/camerasetup/:tutorialId" element={<SetupCamera />} />
        <Route path="/instruction/:tutorialId" element={<Instruction />} />
        <Route path="/camera-step-completion/:tutorialId" element={<CameraStepCompletion />} />
        <Route path="/preview/:tutorialId" element={<Preview />} />
        <Route path="/zoom" element={<Zoom />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/alldone" element={<AllDone/>} />
        <Route path="/verified/:tutorialId" element={<Verified />} />
        <Route path="/help/:tutorialId" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
