# Nuzzy — Prototype Build Guide
**Goal:** Landing page + encounter logging, fully functional, saved to localStorage.  
**Stack:** React + TypeScript + Vite + Tailwind CSS + React Router  
**Est. Time:** ~3 hours

---

## Before You Start

Open two things:
- Your terminal
- VS Code (or your editor)

You'll be switching between them constantly. Keep this guide open in a browser tab.

---

## Step 1 — Project Setup
**Time: ~20 min**

### 1.1 Scaffold the project
```bash
npm create vite@latest nuzzy -- --template react-ts
cd nuzzy
```

### 1.2 Install dependencies
```bash
npm install
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

> **Note:** Tailwind v4 no longer uses `postcss`, `autoprefixer`, or `tailwind.config.js`. No init command needed.

### 1.3 Configure Tailwind in Vite
Open `vite.config.ts` and replace everything with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### 1.4 Set up Tailwind CSS
Open `src/index.css` and replace **everything** with:
```css
@import "tailwindcss";
```

### 1.5 Clean up Vite defaults
Delete these files — you won't need them:
- `src/App.css`
- `src/assets/react.svg`
- `public/vite.svg`

### 1.6 Verify it works
```bash
npm run dev
```
Open `http://localhost:5173`. You should see something render (even if broken). If you get an error, check that all installs completed without errors.

---

## Step 2 — Folder Structure
**Time: ~5 min**

Create this structure inside `src/`. You can do it in VS Code's file explorer or via terminal.

```
src/
├── components/
│   └── Navbar.tsx
├── pages/
│   ├── Landing.tsx
│   ├── NewRun.tsx
│   └── Tracker.tsx
├── data/
│   └── routes.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

> **Why this structure?** Separating pages, components, data, and types keeps things easy to find as the project grows and looks professional in your GitHub repo.

---

## Step 3 — Define Your Types
**Time: ~10 min**

Open `src/types/index.ts` and add:

```ts
export type Status = "Alive" | "Dead" | "Boxed"

export interface Encounter {
  id: string
  route: string
  pokemon: string
  nickname: string
  status: Status
}

export interface Run {
  id: string
  name: string
  game: string
  createdAt: string
  encounters: Encounter[]
}
```

> **Why first?** TypeScript will now autocomplete and catch mistakes everywhere you use these shapes. Do this before writing components, not after.

---

## Step 4 — Route Data
**Time: ~5 min**

Open `src/data/routes.ts` and add your Emerald Seaglass routes:

```ts
export const ROUTES: string[] = [
  "Route 101",
  "Route 102",
  "Route 103",
  "Petalburg Woods",
  "Route 104",
  "Rustboro City",
  "Route 116",
  "Rusturf Tunnel",
  "Route 110",
  "Mauville City",
]
```

You can add more later. This is enough to demo tonight.

---

## Step 5 — App.tsx and Routing
**Time: ~15 min**

Replace everything in `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
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
```

---

## Step 6 — Navbar Component
**Time: ~15 min**

Open `src/components/Navbar.tsx`:

```tsx
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-red-400 hover:text-red-300">
          Nuzzy
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/new-run" className="text-gray-300 hover:text-white transition-colors">
            New Run
          </Link>
          <Link to="/tracker" className="text-gray-300 hover:text-white transition-colors">
            Tracker
          </Link>
        </div>
      </div>
    </nav>
  )
}
```

---

## Step 7 — Landing Page
**Time: ~20 min**

Open `src/pages/Landing.tsx`:

```tsx
import { Link } from "react-router-dom"

export default function Landing() {
  return (
    <div className="text-center py-16 space-y-8">

      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-white">
          Nuzzy
        </h1>
        <p className="text-xl text-gray-400 max-w-xl mx-auto">
          A Nuzlocke tracker for Pokémon Emerald Seaglass. Log encounters,
          track your team, and mourn your fallen.
        </p>
        <Link
          to="/new-run"
          className="inline-block mt-4 px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg transition-colors"
        >
          Start a Run
        </Link>
      </div>

      {/* Rules */}
      <div className="border border-gray-800 rounded-xl p-8 text-left max-w-lg mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-gray-200">The Nuzlocke Rules</h2>
        <div className="space-y-3 text-gray-400">
          <div>
            <h3 className="text-white font-medium">First Encounter Only</h3>
            <p className="text-sm">Catch only the first Pokémon encountered in each area.</p>
          </div>
          <div>
            <h3 className="text-white font-medium">Permadeath</h3>
            <p className="text-sm">If a Pokémon faints, it's dead. Release it or box it permanently.</p>
          </div>
          <div>
            <h3 className="text-white font-medium">Nicknames Required</h3>
            <p className="text-sm">All Pokémon must be nicknamed. Feel the loss.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
```

---

## Step 8 — New Run Page
**Time: ~20 min**

Open `src/pages/NewRun.tsx`:

```tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Run } from "../types"

export default function NewRun() {
  const [runName, setRunName] = useState("")
  const navigate = useNavigate()

  function handleStart() {
    if (!runName.trim()) return

    const newRun: Run = {
      id: crypto.randomUUID(),
      name: runName.trim(),
      game: "Pokémon Emerald Seaglass",
      createdAt: new Date().toISOString(),
      encounters: [],
    }

    localStorage.setItem("nuzzy_run", JSON.stringify(newRun))
    navigate("/tracker")
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New Run</h1>
        <p className="text-gray-400 mt-1">Pokémon Emerald Seaglass</p>
      </div>

      <div className="space-y-3">
        <label htmlFor="run-name" className="block text-sm font-medium text-gray-300">
          Run Name
        </label>
        <input
          id="run-name"
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="e.g. My First Nuzlocke"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
      </div>

      <button
        onClick={handleStart}
        disabled={!runName.trim()}
        className="w-full py-3 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        Begin Run
      </button>
    </div>
  )
}
```

---

## Step 9 — Tracker Page (Core Feature)
**Time: ~40 min**

This is the most complex page. Take your time here.

Open `src/pages/Tracker.tsx`:

```tsx
import { useState, useEffect } from "react"
import { Run, Encounter, Status } from "../types"
import { ROUTES } from "../data/routes"

const STATUS_COLORS: Record<Status, string> = {
  Alive: "text-green-400",
  Dead: "text-red-400",
  Boxed: "text-yellow-400",
}

export default function Tracker() {
  const [run, setRun] = useState<Run | null>(null)
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0])
  const [pokemon, setPokemon] = useState("")
  const [nickname, setNickname] = useState("")
  const [status, setStatus] = useState<Status>("Alive")

  // Load run from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nuzzy_run")
    if (saved) {
      setRun(JSON.parse(saved))
    }
  }, [])

  // Save run to localStorage whenever it changes
  useEffect(() => {
    if (run) {
      localStorage.setItem("nuzzy_run", JSON.stringify(run))
    }
  }, [run])

  function handleAddEncounter() {
    if (!run || !pokemon.trim() || !nickname.trim()) return

    const newEncounter: Encounter = {
      id: crypto.randomUUID(),
      route: selectedRoute,
      pokemon: pokemon.trim(),
      nickname: nickname.trim(),
      status,
    }

    setRun({ ...run, encounters: [...run.encounters, newEncounter] })
    setPokemon("")
    setNickname("")
    setStatus("Alive")
  }

  function handleStatusChange(encounterId: string, newStatus: Status) {
    if (!run) return
    const updated = run.encounters.map((e) =>
      e.id === encounterId ? { ...e, status: newStatus } : e
    )
    setRun({ ...run, encounters: updated })
  }

  if (!run) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No active run found.</p>
        <a href="/new-run" className="text-red-400 hover:underline mt-2 block">
          Start a new run
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Run Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{run.name}</h1>
        <p className="text-gray-400">{run.game}</p>
      </div>

      {/* Log Encounter Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Log Encounter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Route */}
          <div className="space-y-1">
            <label htmlFor="route" className="block text-sm text-gray-400">Route</label>
            <select
              id="route"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {ROUTES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label htmlFor="status" className="block text-sm text-gray-400">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="Alive">Alive</option>
              <option value="Dead">Dead</option>
              <option value="Boxed">Boxed</option>
            </select>
          </div>

          {/* Pokémon Name */}
          <div className="space-y-1">
            <label htmlFor="pokemon" className="block text-sm text-gray-400">Pokémon</label>
            <input
              id="pokemon"
              type="text"
              value={pokemon}
              onChange={(e) => setPokemon(e.target.value)}
              placeholder="e.g. Torchic"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Nickname */}
          <div className="space-y-1">
            <label htmlFor="nickname" className="block text-sm text-gray-400">Nickname</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEncounter()}
              placeholder="e.g. Blaze"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddEncounter}
          disabled={!pokemon.trim() || !nickname.trim()}
          className="px-6 py-2 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Log Encounter
        </button>
      </div>

      {/* Encounter List */}
      {run.encounters.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Encounters ({run.encounters.length})
          </h2>
          <div className="space-y-2">
            {run.encounters.map((encounter) => (
              <div
                key={encounter.id}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
              >
                <div>
                  <span className="font-medium text-white">{encounter.nickname}</span>
                  <span className="text-gray-400 text-sm ml-2">({encounter.pokemon})</span>
                  <span className="text-gray-600 text-sm ml-2">— {encounter.route}</span>
                </div>
                <select
                  value={encounter.status}
                  onChange={(e) => handleStatusChange(encounter.id, e.target.value as Status)}
                  className={`bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none ${STATUS_COLORS[encounter.status]}`}
                  aria-label={`Status for ${encounter.nickname}`}
                >
                  <option value="Alive">Alive</option>
                  <option value="Dead">Dead</option>
                  <option value="Boxed">Boxed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {run.encounters.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No encounters logged yet. Your journey begins.
        </p>
      )}

    </div>
  )
}
```

---

## Step 10 — Final Cleanup
**Time: ~10 min**

### 10.1 Fix main.tsx
Open `src/main.tsx` and make sure it looks like this:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

### 10.2 Run and verify
```bash
npm run dev
```

Walk through this checklist:
- [ ] Landing page loads at `/`
- [ ] "Start a Run" button goes to `/new-run`
- [ ] Creating a run navigates to `/tracker`
- [ ] Logging an encounter adds it to the list
- [ ] Changing an encounter's status updates it
- [ ] Refreshing the page — encounters are still there (localStorage working)
- [ ] Navbar links all work

### 10.3 Fix TypeScript errors
Run the type checker:
```bash
npx tsc --noEmit
```
Fix any errors it reports. If you're stuck on one for more than 10 minutes, add `: any` as a temporary fix and move on.

---

## Step 11 — Push to GitHub
**Time: ~10 min**

```bash
git init
git add .
git commit -m "feat: initial prototype — landing page and encounter logging"
```

Go to GitHub, create a new **empty** repository called `nuzzy`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nuzzy.git
git branch -M main
git push -u origin main
```

---

## Step 12 — Deploy (Optional but Recommended)
**Time: ~5 min**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `nuzzy` repo
4. Leave all settings as default — Vercel detects Vite automatically
5. Click Deploy

You'll get a live URL like `nuzzy.vercel.app` in under 2 minutes. Paste this link in every application.

---

## You're Done When...

- [ ] The app runs locally without errors
- [ ] You can create a run, log encounters, and change statuses
- [ ] Data persists on refresh
- [ ] Code is pushed to GitHub
- [ ] (Bonus) Live URL from Vercel

---

## Common Errors & Fixes

| Error | Fix |
|---|---|
| `Cannot find module 'react-router-dom'` | Run `npm install` again |
| Tailwind classes not applying | Check `vite.config.ts` has the `tailwindcss()` plugin, and `index.css` starts with `@import "tailwindcss"` |
| `localStorage` undefined | You're in SSR context — not an issue with Vite, ignore |
| TypeScript red squiggles everywhere | Check your import paths match your actual file names exactly |
| Blank white page | Open browser console (F12) and read the error |

---

## What to Build Next

Once the prototype is working, the next most valuable additions are:

1. **Pokémon sprites** via PokéAPI (`https://pokeapi.co/api/v2/pokemon/{name}`) — makes it feel real
2. **Stats bar** — alive/dead/boxed counts at a glance
3. **Accessibility pass** — alt text, heading hierarchy, keyboard nav
4. **Multiple runs** — list of saved runs in localStorage

Good luck. You've got everything you need.
