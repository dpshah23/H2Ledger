function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          🚀 H2Ledger Platform
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-600">✅ Backend Status</h2>
            <p className="text-gray-600">Django server running on:</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">http://localhost:8000</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">✅ Frontend Status</h2>
            <p className="text-gray-600">React app running on:</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded">http://localhost:3001</p>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">🎯 H2Ledger Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-medium text-green-800">Credits Management</h3>
              <p className="text-sm text-green-600">Track and manage hydrogen credits</p>
            </div>
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-medium text-blue-800">Trading System</h3>
              <p className="text-sm text-blue-600">Buy and sell credits on marketplace</p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-medium text-purple-800">Audit Portal</h3>
              <p className="text-sm text-purple-600">Verify transactions and compliance</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => alert('H2Ledger Platform is working correctly!')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Test Platform ✨
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
