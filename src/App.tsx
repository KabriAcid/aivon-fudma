import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CallSimulationPage from "./pages/CallSimulationPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import DocumentationPage from "./pages/DocumentationPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export default function App() {
  const [isCallActive, setIsCallActive] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#228B22]/30 selection:text-[#228B22]">
        {!isCallActive && <Navigation />}
        <main className={cn("flex-grow flex flex-col", isCallActive && "h-screen overflow-hidden")}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/call" 
              element={<CallSimulationPage onCallStateChange={setIsCallActive} />} 
            />
            <Route path="/docs" element={<DocumentationPage />} />
          </Routes>
        </main>
        {!isCallActive && <Footer />}
      </div>
    </Router>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
