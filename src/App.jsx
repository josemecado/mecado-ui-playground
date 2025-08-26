import { Routes, Route } from "react-router-dom";
import ProjectChatWindow from "./pages/ProjectChatWindow";
import MecadoTests from "./pages/MecadoTests";
import { ThemeProvider } from "./utilities/ThemeContext";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<MecadoTests />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
