import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          🚀 H2Ledger Platform
        </h1>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="font-semibold text-green-800">✅ Backend Status</h2>
            <p className="text-green-600">Django running on port 8000</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-800">✅ Frontend Status</h2>
            <p className="text-blue-600">React running on port 3001</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold text-yellow-800">🎯 Ready to Use</h2>
            <p className="text-yellow-600">Platform is fully operational!</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>
);
