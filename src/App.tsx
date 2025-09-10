import { AuthProvider } from './hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import AuthGuard from './components/auth/AuthGuard';

// Para desarrollo, define __BASE_PATH__ si no existe
const basePath = typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basePath}>
        <AuthGuard>
          <AppRoutes />
        </AuthGuard>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;