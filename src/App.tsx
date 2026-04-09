import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/NavBar"
import Landing from "./pages/Landing"
import NewRun from "./pages/NewRun"
import Tracker from "./pages/Tracker"
import Box from "./pages/Box"
import Graveyard from "./pages/Graveyard"

const NAVBAR_ROUTES = new Set(["/tracker", "/box", "/graveyard"])

function AppShell() {
  const { pathname } = useLocation()
  const showNav = NAVBAR_ROUTES.has(pathname)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showNav && <Navbar />}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/new-run" element={<NewRun />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/box" element={<Box />} />
          <Route path="/graveyard" element={<Graveyard />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
