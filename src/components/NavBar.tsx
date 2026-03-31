import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-red-400 hover:text-red-300">
          Nuzzy
        </Link>
        <div className="flex gap-6">
          <Link to="/new-run" className="text-gray-300 hover:text-white transition-colors">
            New Run
          </Link>
        </div>
      </div>
    </nav>
  )
}
