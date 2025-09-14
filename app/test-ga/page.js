'use client';

import { trackEvent, GA_TRACKING_ID } from '../../lib/gtag';
import { useEffect } from 'react';

export default function TestGAPage() {
  useEffect(() => {
    console.log('Test GA Page loaded');
    console.log('GA_TRACKING_ID from gtag:', GA_TRACKING_ID);
    console.log('window.gtag available:', typeof window !== 'undefined' && typeof window.gtag !== 'undefined');
    console.log('window.dataLayer available:', typeof window !== 'undefined' && typeof window.dataLayer !== 'undefined');
  }, []);

  const handleTestEvent = () => {
    console.log('Testing button click event...');
    trackEvent.buttonClick('Test Button', 'GA Test Page');
    alert('Event tracked! Check your Google Analytics dashboard and browser console.');
  };

  const handleTestFormSubmit = () => {
    trackEvent.formSubmit('Test Form');
    alert('Form submission tracked!');
  };

  const handleTestExternalLink = () => {
    trackEvent.externalLink('https://google.com');
    alert('External link click tracked!');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Google Analytics Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Current Configuration
            </h2>
            <div className="text-blue-800 space-y-2">
              <p><strong>GA Tracking ID:</strong> <code className="bg-blue-100 px-1 rounded">{GA_TRACKING_ID || 'Not set'}</code></p>
              <p><strong>Environment:</strong> <code className="bg-blue-100 px-1 rounded">{process.env.NODE_ENV}</code></p>
              <p><strong>Check browser console for debug logs</strong></p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              Debugging Steps
            </h2>
            <ol className="list-decimal list-inside text-green-800 space-y-1">
              <li>Open browser Developer Tools (F12)</li>
              <li>Check the <strong>Console</strong> tab for GA debug messages</li>
              <li>Check the <strong>Network</strong> tab for requests to googletagmanager.com</li>
              <li>Look for any error messages in red</li>
              <li>Test the buttons below and watch console output</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Test Event Tracking
            </h2>
            
            <button
              onClick={handleTestEvent}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Button Click Event
            </button>
            
            <button
              onClick={handleTestFormSubmit}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Form Submission Event
            </button>
            
            <button
              onClick={handleTestExternalLink}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test External Link Click Event
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              How to Verify
            </h3>
            <ul className="list-disc list-inside text-yellow-800 space-y-1">
              <li>Open Google Analytics dashboard</li>
              <li>Go to <strong>Reports → Realtime</strong></li>
              <li>Click the test buttons above</li>
              <li>You should see events appear in the realtime report</li>
              <li>Check <strong>Events</strong> section for custom events</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browser Developer Tools
            </h3>
            <p className="text-gray-700">
              Open Developer Tools (F12) and check the <strong>Network</strong> tab for requests to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><code>googletagmanager.com</code></li>
              <li><code>google-analytics.com</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
