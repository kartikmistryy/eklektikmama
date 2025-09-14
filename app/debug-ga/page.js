'use client';

import { useEffect } from 'react';

export default function DebugGAPage() {
  useEffect(() => {
    console.log('=== GA DEBUG INFO ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_GA_ID:', process.env.NEXT_PUBLIC_GA_ID);
    console.log('window.gtag:', typeof window !== 'undefined' ? typeof window.gtag : 'undefined');
    console.log('window.dataLayer:', typeof window !== 'undefined' ? window.dataLayer : 'undefined');
    console.log('====================');
  }, []);

  const testDirectGA = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'test_event', {
        event_category: 'debug',
        event_label: 'direct_test',
        value: 1
      });
      console.log('Direct GA event sent');
      alert('Direct GA event sent! Check console and GA dashboard.');
    } else {
      console.error('window.gtag not available');
      alert('GA not available - check console for errors');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          GA Debug Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Environment Variables
            </h2>
            <div className="text-red-800 space-y-2">
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>NEXT_PUBLIC_GA_ID:</strong> {process.env.NEXT_PUBLIC_GA_ID || 'NOT SET'}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Browser Objects
            </h2>
            <div className="text-yellow-800 space-y-2">
              <p><strong>window.gtag:</strong> {typeof window !== 'undefined' ? (window.gtag ? 'Available' : 'Not available') : 'Server side'}</p>
              <p><strong>window.dataLayer:</strong> {typeof window !== 'undefined' ? (window.dataLayer ? 'Available' : 'Not available') : 'Server side'}</p>
            </div>
          </div>

          <button
            onClick={testDirectGA}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Test Direct GA Event
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Instructions
            </h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Open browser console (F12)</li>
              <li>Refresh this page</li>
              <li>Look for "=== GA DEBUG INFO ===" in console</li>
              <li>Click the test button above</li>
              <li>Check for any error messages</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
