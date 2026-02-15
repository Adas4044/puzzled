import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AllDone from "./pages/AllDone";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Language />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/camerasetup" element={<SetupCamera />} />
        <Route path="/instruction" element={<Instruction />} />
        <Route path="/camera-step-completion" element={<CameraStepCompletion />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/zoom" element={<Zoom />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/alldone" element={<AllDone/>} />
        <Route path="/verified" element={<Verified activeStep={1} totalSteps={5} />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
