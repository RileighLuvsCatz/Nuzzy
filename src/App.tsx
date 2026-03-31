import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/NavBar"
import Landing from "./pages/Landing"
import NewRun from "./pages/NewRun"
import Tracker from "./pages/Tracker"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/new-run" element={<NewRun />} />
            <Route path="/tracker" element={<Tracker />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App