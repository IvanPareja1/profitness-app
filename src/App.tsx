import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log('App mounted - checking for errors...');
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ProFitness App</h1>
          <p className="text-gray-600">Cargando aplicación...</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;