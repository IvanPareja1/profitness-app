
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { AuthProvider } from './hooks/useAuth';
import AuthGuard from './components/auth/AuthGuard';

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
