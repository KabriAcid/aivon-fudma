import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CallSimulationPage from "./pages/CallSimulationPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#228B22]/30 selection:text-[#228B22]">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/call" element={<CallSimulationPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
