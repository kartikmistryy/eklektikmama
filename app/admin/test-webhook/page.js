'use client';

import { useState } from 'react';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [eventId, setEventId] = useState('');

  const testWebhook = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    if (!eventId) {
      alert('Please enter an event ID');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId })
      });
      const data = await response.json();
      setResult(data);
      
      if (data.url) {
        // Open Stripe checkout in new window
        window.open(data.url, '_blank');
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#093166] text-white p-6">
            <h1 className="text-2xl md:text-3xl font-antonio uppercase">Test Webhook Setup</h1>
            <p className="text-blue-100 mt-2">Test the complete payment and webhook flow</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Test 1: Direct Webhook Test */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Test 1: Direct Webhook Processing</h2>
              <p className="text-sm text-gray-600 mb-4">
                This simulates a webhook event directly without going through Stripe. 
                Use this to test if the booking creation and Google Sheets integration works.
              </p>
              <button
                onClick={testWebhook}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Webhook Processing'}
              </button>
            </div>

            {/* Test 2: Real Payment Flow */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Test 2: Real Payment Flow</h2>
              <p className="text-sm text-gray-600 mb-4">
                This creates a real Stripe checkout session. Complete the payment to test the actual webhook.
                Make sure you have Stripe CLI running with: <code className="bg-gray-100 px-1">stripe listen --forward-to localhost:3000/api/webhooks/stripe</code>
              </p>
              <div className="flex gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event ID
                  </label>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="Enter event ID"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166]"
                  />
                </div>
                <button
                  onClick={testPayment}
                  disabled={loading || !eventId}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Test Payment'}
                </button>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className={`border rounded-lg p-4 ${
                result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Success' : '❌ Error'}
                </h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Setup Instructions</h3>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Install Stripe CLI: <code className="bg-yellow-100 px-1">brew install stripe/stripe-cli/stripe</code></li>
                <li>Login: <code className="bg-yellow-100 px-1">stripe login</code></li>
                <li>Start webhook forwarding: <code className="bg-yellow-100 px-1">stripe listen --forward-to localhost:3000/api/webhooks/stripe</code></li>
                <li>Copy the webhook secret to your .env file</li>
                <li>Test the payment flow above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
