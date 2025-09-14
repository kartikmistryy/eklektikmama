'use client';

import { trackEvent, GA_TRACKING_ID } from '../../lib/gtag';

export default function TestGAPage() {
  const handleTestEvent = () => {
    trackEvent.buttonClick('Test Button', 'GA Test Page');
    alert('Event tracked! Check your Google Analytics dashboard.');
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
            </div>
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
        </div>
      </div>
    </div>
  );
}
