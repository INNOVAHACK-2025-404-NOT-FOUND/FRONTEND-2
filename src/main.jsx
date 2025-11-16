import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import DashboardSimple from './pages/DashboardSimple.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Uploads from './pages/Uploads.jsx'
import Admin from './pages/Admin.jsx'
import ScenarioComparison from './pages/ScenarioComparison.jsx'
import ScenarioBuilder from './pages/ScenarioBuilder.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardSimple />
          </ProtectedRoute>
        ),
      },
      {
        path: 'uploads',
        element: (
          <ProtectedRoute>
            <Uploads />
          </ProtectedRoute>
        ),
      },
      {
        path: 'scenarios/comparison',
        element: (
          <ProtectedRoute>
            <ScenarioComparison />
          </ProtectedRoute>
        ),
      },
      {
        path: 'scenarios/builder',
        element: (
          <ProtectedRoute>
            <ScenarioBuilder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            <Admin />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
