'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [formData, setFormData] = useState({
    email: '',
    guardianName: 'Test User',
    childName: 'Test Child',
    numberOfTickets: 1,
    transactionId: 'TEST-' + Date.now()
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Test Email Functionality</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian/Parent Name
              </label>
              <input
                type="text"
                id="guardianName"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                placeholder="Enter guardian name"
              />
            </div>

            <div>
              <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                Child Name
              </label>
              <input
                type="text"
                id="childName"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                placeholder="Enter child name"
              />
            </div>

            <div>
              <label htmlFor="numberOfTickets" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tickets
              </label>
              <input
                type="number"
                id="numberOfTickets"
                name="numberOfTickets"
                value={formData.numberOfTickets}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                placeholder="Enter transaction ID"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DB4E9F] text-white py-3 px-6 rounded-md hover:bg-[#DB4E9F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Email...' : 'Send Test Email'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-md ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <p className="text-sm">{result.message || result.error}</p>
              {result.campaignId && (
                <p className="text-sm mt-2">
                  <strong>Campaign ID:</strong> {result.campaignId}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Email Configuration Options</h3>
            <p className="text-sm text-blue-700 mb-2">
              You can use any of these email services (no audience ID required):
            </p>
            
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="font-medium text-green-800">Option 1: SendGrid (Recommended)</h4>
                <p className="text-sm text-green-700">Free tier: 100 emails/day</p>
                <code className="text-xs bg-green-100 px-2 py-1 rounded">SENDGRID_API_KEY=your_api_key</code>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-medium text-blue-800">Option 2: Resend</h4>
                <p className="text-sm text-blue-700">Free tier: 100 emails/day</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded">RESEND_API_KEY=your_api_key</code>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-3">
                <h4 className="font-medium text-purple-800">Option 3: Gmail SMTP</h4>
                <p className="text-sm text-purple-700">Requires app password</p>
                <div className="space-y-1">
                  <code className="text-xs bg-purple-100 px-2 py-1 rounded">GMAIL_USER=your_email@gmail.com</code>
                  <br />
                  <code className="text-xs bg-purple-100 px-2 py-1 rounded">GMAIL_APP_PASSWORD=your_app_password</code>
                </div>
              </div>
              
              <div className="border-l-4 border-gray-500 pl-3">
                <h4 className="font-medium text-gray-800">Option 4: Console Log (Development)</h4>
                <p className="text-sm text-gray-700">No setup required - emails logged to console</p>
              </div>
            </div>
            
            <p className="text-sm text-blue-700 mt-3">
              <strong>Note:</strong> The system will automatically use the first available service in the order listed above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
