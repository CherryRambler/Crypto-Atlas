import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import CoinDetailPage from './pages/CoinDetailPage'
import AlertsPage from './pages/AlertsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'coin/:id',
            element: <CoinDetailPage />,
          },
          {
            path: 'alerts',
            element: <AlertsPage />,
          },
        ],
      },
    ],
  },
])
