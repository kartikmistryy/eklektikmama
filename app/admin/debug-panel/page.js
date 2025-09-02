"use client";
import { useState } from 'react';

export default function DebugPanel() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const debugRoutes = [
    {
      name: "Checkout Environment",
      route: "/api/debug-checkout",
      description: "Check Stripe and environment variables for checkout"
    },
    {
      name: "Database Connection (Checkout)",
      route: "/api/test-db-checkout",
      description: "Test database connection specifically for checkout"
    },
    {
      name: "All Environment Variables",
      route: "/api/debug-env",
      description: "Check all environment variables"
    },
    {
      name: "Stripe Connection",
      route: "/api/test-stripe",
      description: "Test Stripe API connection"
    },
    {
      name: "Stripe Detailed Test",
      route: "/api/debug-stripe-detailed",
      description: "Detailed Stripe diagnostics and troubleshooting"
    },
    {
      name: "Database Connection",
      route: "/api/test-db",
      description: "Test general database connection"
    },
    {
      name: "Google Sheets",
      route: "/api/test-sheets",
      description: "Test Google Sheets integration"
    },
    {
      name: "Email Service",
      route: "/api/test-email",
      description: "Test email functionality"
    },
    {
      name: "Webhook Test",
      route: "/api/test-webhook",
      description: "Test webhook functionality"
    }
  ];

  const testRoute = async (route) => {
    setLoading(prev => ({ ...prev, [route]: true }));
    setResults(prev => ({ ...prev, [route]: null }));

    try {
      const response = await fetch(route);
      const data = await response.json();
      
      setResults(prev => ({
        ...prev,
        [route]: {
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [route]: {
          status: 'ERROR',
          data: { error: error.message },
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [route]: false }));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 Debug Panel</h1>
          <p className="text-gray-600 mb-4">
            Test all API routes to identify issues in production
          </p>
          <div className="flex gap-4">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
            <button
              onClick={() => debugRoutes.forEach(route => testRoute(route.route))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Test All Routes
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {debugRoutes.map((route) => (
            <div key={route.route} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{route.name}</h3>
                  <p className="text-gray-600 text-sm">{route.description}</p>
                  <p className="text-gray-500 text-xs font-mono">{route.route}</p>
                </div>
                <button
                  onClick={() => testRoute(route.route)}
                  disabled={loading[route.route]}
                  className={`px-4 py-2 rounded transition-colors ${
                    loading[route.route]
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {loading[route.route] ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Testing...
                    </div>
                  ) : (
                    'Test Route'
                  )}
                </button>
              </div>

              {results[route.route] && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      results[route.route].status === 200 || results[route.route].status === 'ERROR'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {results[route.route].status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {results[route.route].timestamp}
                    </span>
                  </div>
                  
                  <div className="bg-white rounded border p-3">
                    <pre className="text-xs text-gray-800 overflow-x-auto">
                      {JSON.stringify(results[route.route].data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Quick Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {debugRoutes.map((route) => {
              const result = results[route.route];
              const status = result?.status;
              const isSuccess = status === 200;
              const isError = status === 'ERROR' || (status && status >= 400);
              const isPending = loading[route.route];
              
              return (
                <div key={route.route} className="text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    isPending ? 'bg-yellow-400' :
                    isSuccess ? 'bg-green-400' :
                    isError ? 'bg-red-400' : 'bg-gray-300'
                  }`}></div>
                  <p className="text-xs text-gray-600">{route.name}</p>
                  <p className="text-xs font-mono text-gray-500">
                    {isPending ? 'Testing...' : 
                     isSuccess ? '✅ OK' : 
                     isError ? '❌ Error' : '⏳ Not tested'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
