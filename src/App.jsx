import { Routes, Route } from "react-router-dom";
import VulcanDashboard from "./pages/Dashboard";

import { ThemeProvider } from "./utilities/ThemeContext";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<VulcanDashboard />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
