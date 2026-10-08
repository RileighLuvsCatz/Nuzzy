import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import Landing from "./pages/Landing";
import NewRun from "./pages/NewRun";
import Tracker from "./pages/Tracker";
import Box from "./pages/Box";
import Graveyard from "./pages/Graveyard";

function AppShell() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main
        id="main-content"
        className={`main-content ${pathname === "/" ? "home-content" : ""}`}
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/new-run" element={<NewRun />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/box" element={<Box />} />
          <Route path="/graveyard" element={<Graveyard />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>Made for the journey. And the friends along the way.</span>
        <span>Nuzzy · A fan-made Pokémon companion</span>
      </footer>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
