import { BrowserRouter, Routes, Route } from "react-router-dom";
import Camera from "./pages/Camera";
import Preview from "./pages/Preview";
import Language from "./pages/Language";
import Tutorial from "./pages/Tutorial";
import Zoom from "./pages/Zoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/camera" element={<Camera />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/" element={<Language />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/zoom" element={<Zoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;