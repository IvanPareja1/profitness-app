
import { AuthProvider } from './hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import AuthGuard from './components/auth/AuthGuard';


const __BASE_PATH__ = import.meta.env.BASE_URL || '/';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <AuthGuard>
          <AppRoutes />
        </AuthGuard>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
