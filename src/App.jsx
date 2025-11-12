import { Routes, Route } from "react-router-dom";
import ProjectManagementIndex from "./pages/projectManagement/ProjectManagementIndex.tsx";

import { ThemeProvider } from "./utilities/ThemeContext";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<ProjectManagementIndex />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
