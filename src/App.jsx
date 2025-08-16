import { useState } from 'react'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CssBaseline from '@mui/material/CssBaseline'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container
      maxWidth="sm"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-6"
    >
      <CssBaseline />
      <div className="flex items-center justify-center gap-6">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className="h-24 w-24 transition hover:drop-shadow-lg"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className="h-24 w-24 transition hover:drop-shadow-lg motion-safe:animate-spin"
            alt="React logo"
          />
        </a>
      </div>
      <Typography variant="h3" component="h1" gutterBottom>
        Vite + React
      </Typography>
      <div className="flex flex-col items-center gap-3">
        <Button variant="contained" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </Button>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit <code className="font-mono">src/App.jsx</code> and save to test HMR
        </p>
      </div>
      {/* Tailwind verification banner */}
      <div className="rounded-xl border border-slate-300/30 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg">
        <div className="rounded-xl bg-white/95 p-4 dark:bg-zinc-900/80">
          <p className="text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Tailwind is active — try changing classes like <span className="font-semibold text-indigo-600 dark:text-indigo-400">from-indigo-500</span>
          </p>
        </div>
      </div>
    </Container>
  )
}

export default App
