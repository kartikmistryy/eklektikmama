'use client';

import { useState } from 'react';

export default function TestFormsPage() {
  const [activeForm, setActiveForm] = useState('perks');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Partner form state
  const [partnerForm, setPartnerForm] = useState({
    name: 'Test User',
    email: '',
    isBrand: 'yes',
    interestedInFranchise: 'no',
    note: 'This is a test submission from the admin panel.'
  });

  // Perks form state
  const [perksForm, setPerksForm] = useState({
    name: 'Test User',
    email: '',
    website: 'https://example.com',
    isBrand: 'yes',
    interestedInFranchise: 'no'
  });
  const [partnershipType, setPartnershipType] = useState('Product Collab (Feature your product with us)');
  const [otherDetails, setOtherDetails] = useState('');

  const handlePartnerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/partner-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partnerForm),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePerksSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const submitData = {
        ...perksForm,
        partnershipType,
        otherDetails: partnershipType === "Other (Please specify)" ? otherDetails : ""
      };

      const response = await fetch('/api/perks-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === 'partner') {
      setPartnerForm(prev => ({ ...prev, [field]: value }));
    } else {
      setPerksForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Test Form Submissions to Mailchimp</h1>
          
          {/* Form Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveForm('partner')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeForm === 'partner' 
                  ? 'bg-[#DB4E9F] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Partner Form
            </button>
            <button
              onClick={() => setActiveForm('perks')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeForm === 'perks' 
                  ? 'bg-[#DB4E9F] text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Perks Form
            </button>
          </div>

          {/* Partner Form */}
          {activeForm === 'partner' && (
            <form onSubmit={handlePartnerSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Partner Form Test</h2>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={partnerForm.name}
                  onChange={(e) => handleInputChange('partner', 'name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={partnerForm.email}
                  onChange={(e) => handleInputChange('partner', 'email', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you a brand? *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="yes"
                      checked={partnerForm.isBrand === "yes"}
                      onChange={(e) => handleInputChange('partner', 'isBrand', e.target.value)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="no"
                      checked={partnerForm.isBrand === "no"}
                      onChange={(e) => handleInputChange('partner', 'isBrand', e.target.value)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interested in franchise? *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="yes"
                      checked={partnerForm.interestedInFranchise === "yes"}
                      onChange={(e) => handleInputChange('partner', 'interestedInFranchise', e.target.value)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="no"
                      checked={partnerForm.interestedInFranchise === "no"}
                      onChange={(e) => handleInputChange('partner', 'interestedInFranchise', e.target.value)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Note *
                </label>
                <textarea
                  id="note"
                  value={partnerForm.note}
                  onChange={(e) => handleInputChange('partner', 'note', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DB4E9F] text-white py-3 px-6 rounded-md hover:bg-[#DB4E9F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Partner Form'}
              </button>
            </form>
          )}

          {/* Perks Form */}
          {activeForm === 'perks' && (
            <form onSubmit={handlePerksSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Perks Form Test</h2>
              
              <div>
                <label htmlFor="perks-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="perks-name"
                  value={perksForm.name}
                  onChange={(e) => handleInputChange('perks', 'name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="perks-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="perks-email"
                  value={perksForm.email}
                  onChange={(e) => handleInputChange('perks', 'email', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website *
                </label>
                <input
                  type="url"
                  id="website"
                  value={perksForm.website}
                  onChange={(e) => handleInputChange('perks', 'website', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partnership Type *
                </label>
                <div className="space-y-2">
                  {[
                    "Product Collab (Feature your product with us)",
                    "Service Collab (Bundle OR Cross-promote)",
                    "Brand Promo (Get listed in our partner dictionary)",
                    "Event/ Campaign (Co-host OR Sponsor)",
                    "Affiliate/Referral (Earn through referrals)",
                    "Other (Please specify)",
                  ].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="radio"
                        value={type}
                        checked={partnershipType === type}
                        onChange={(e) => setPartnershipType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {partnershipType === "Other (Please specify)" && (
                <div>
                  <label htmlFor="otherDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Please specify
                  </label>
                  <textarea
                    id="otherDetails"
                    value={otherDetails}
                    onChange={(e) => setOtherDetails(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                    placeholder="Describe your partnership type"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you a brand? *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="yes"
                      checked={perksForm.isBrand === "yes"}
                      onChange={(e) => handleInputChange('perks', 'isBrand', e.target.value)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="no"
                      checked={perksForm.isBrand === "no"}
                      onChange={(e) => handleInputChange('perks', 'isBrand', e.target.value)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interested in franchise? *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="yes"
                      checked={perksForm.interestedInFranchise === "yes"}
                      onChange={(e) => handleInputChange('perks', 'interestedInFranchise', e.target.value)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="no"
                      checked={perksForm.interestedInFranchise === "no"}
                      onChange={(e) => handleInputChange('perks', 'interestedInFranchise', e.target.value)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DB4E9F] text-white py-3 px-6 rounded-md hover:bg-[#DB4E9F]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Perks Form'}
              </button>
            </form>
          )}

          {/* Result Display */}
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
              {result.status && (
                <p className="text-sm mt-2">
                  <strong>Status:</strong> {result.status}
                </p>
              )}
            </div>
          )}

          {/* Configuration Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Mailchimp Configuration Required</h3>
            <p className="text-sm text-blue-700 mb-2">
              Make sure you have these environment variables set:
            </p>
            
            <div className="space-y-2">
              <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
                MAILCHIMP_API_KEY=your_api_key_here
              </code>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
                MAILCHIMP_SERVER_PREFIX=your_server_prefix
              </code>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded block">
                MAILCHIMP_AUDIENCE_ID=your_audience_id
              </code>
            </div>
            
            <p className="text-sm text-blue-700 mt-3">
              <strong>Note:</strong> Form submissions will be saved to Mailchimp with appropriate tags and merge fields for easy segmentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
