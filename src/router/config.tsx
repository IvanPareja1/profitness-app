// src/router/config.tsx
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/dashboard/page";
import Nutrition from "../pages/nutrition/page";
import Exercise from "../pages/exercise/page";
import Progress from '../pages/progress/page';
import Profile from '../pages/profile/page';
import Goals from '../pages/goals/page';
import HealthDataPage from "../pages/HealthData";
import ProtectedRoute from '../components/ProtectedRoute';

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/nutrition",
    element: (
      <ProtectedRoute>
        <Nutrition />
      </ProtectedRoute>
    ),
  },
  {
    path: "/exercise",
    element: (
      <ProtectedRoute>
        <Exercise />
      </ProtectedRoute>
    ),
  },
  {
    path: "/progress",
    element: (
      <ProtectedRoute>
        <Progress />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/goals",
    element: (
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    ),
  },
  {
    path: "/health-data",
    element: (
      <ProtectedRoute>
        <HealthDataPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

export default routes;