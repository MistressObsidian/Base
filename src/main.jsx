import { StrictMode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Download from './pages/Download.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admin from './pages/Admin.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/download', element: <Download /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/admin', element: <Admin /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
