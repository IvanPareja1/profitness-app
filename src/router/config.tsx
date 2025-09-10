// src/router/config.tsx
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Dashboard from "../pages/dashboard/page";
import Nutrition from "../pages/nutrition/page";
import Exercise from "../pages/exercise/page";
import Progress from '../pages/progress/page';
import Profile from '../pages/profile/page';
import Goals from '../pages/goals/page';
import HealthDataForm from '../pages/HealthData';

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/nutrition",
    element: <Nutrition />,
  },
  {
    path: "/exercise",
    element: <Exercise />,
  },
  {
    path: "/progress",
    element: <Progress />
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/goals",
    element: <Goals />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/health-data",
    element: <HealthDataForm />,
  }
];

// ✅ AÑADE ESTA LÍNEA - Exportación por defecto
export default routes;