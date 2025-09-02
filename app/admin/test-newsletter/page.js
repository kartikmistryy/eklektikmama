'use client';

import { useState } from 'react';

export default function TestNewsletterPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testNewsletterSignup = async () => {
    if (!email) {
      setResult('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Success: ${data.message}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Newsletter API Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Newsletter Signup</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="test@example.com"
              />
            </div>
            
            <button
              onClick={testNewsletterSignup}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test Signup'}
            </button>
          </div>
          
          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables Check</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">MAILCHIMP_API_KEY:</span> 
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium">MAILCHIMP_SERVER_PREFIX:</span> 
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_MAILCHIMP_SERVER_PREFIX ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium">MAILCHIMP_AUDIENCE_ID:</span> 
              <span className="ml-2 text-gray-600">
                {process.env.NEXT_PUBLIC_MAILCHIMP_AUDIENCE_ID ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Note: These environment variables are only visible on the client side if prefixed with NEXT_PUBLIC_.
            For security, the actual API calls happen server-side.
          </p>
        </div>
      </div>
    </div>
  );
}
