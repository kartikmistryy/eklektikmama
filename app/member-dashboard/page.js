'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberDashboard() {
  const [email, setEmail] = useState('');
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const checkMembership = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/membership/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.isMember) {
          setMembership(data.membership);
        } else {
          setError('No active membership found for this email address');
          setMembership(null);
        }
      } else {
        setError(data.error || 'Failed to check membership status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!membership) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel your membership?\n\nYou will lose access to all member benefits at the end of your current billing period (${formatDate(membership.currentPeriodEnd)}).\n\nYou can reactivate your membership anytime before the end of your current period.\n\nFor security, we'll send a verification email to confirm this request.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/membership/request-cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: membership.email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('A verification email has been sent to your email address. Please check your inbox and click the verification link to confirm your cancellation request.');
      } else {
        alert(data.error || 'Failed to process cancellation request');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleReactivateMembership = async () => {
    if (!membership) return;

    const confirmed = window.confirm(
      'Are you sure you want to reactivate your membership? Your subscription will continue as normal.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/membership/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: membership.email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Your membership has been reactivated successfully!');
        // Refresh membership data
        checkMembership();
      } else {
        alert(data.error || 'Failed to reactivate membership');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Member Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your Eklektik AF membership and view your benefits
          </p>
        </div>

        {/* Email Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Check Your Membership Status
          </h2>
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={checkMembership}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-2">{error}</p>
          )}
        </div>

        {/* Membership Details */}
        {membership && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Membership Details
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(membership.status)}`}>
                {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{membership.firstName} {membership.lastName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{membership.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Membership Type:</span>
                    <span className="ml-2 font-medium capitalize">{membership.membershipType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Period End:</span>
                    <span className="ml-2 font-medium">{formatDate(membership.currentPeriodEnd)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>10% discount on all event tickets</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Exclusive access to member-only events</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Priority booking for popular events</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Private WhatsApp group access</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Special perks from partner brands</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Savings</h3>
              <p className="text-blue-700">
                You&apos;ve saved <span className="font-bold">{membership.totalSavings || 0} AED</span> so far with your member discounts!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/events')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Events
              </button>
              <button
                onClick={() => router.push('/contactus')}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {/* Cancellation/Reactivation Section */}
            {membership.cancelAtPeriodEnd ? (
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">
                      Membership Cancelled
                    </h3>
                    <p className="text-orange-700 mb-4">
                      Your membership will end on {formatDate(membership.currentPeriodEnd)}. 
                      You can reactivate it anytime before then to continue enjoying all benefits.
                    </p>
                  </div>
                  <button
                    onClick={handleReactivateMembership}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    Reactivate Membership
                  </button>
                </div>
              </div>
            ) : membership.status === 'active' ? (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Cancel Membership
                    </h3>
                    <p className="text-red-700">
                      Need to cancel? You&apos;ll retain access until the end of your current billing period.
                    </p>
                  </div>
                  <button
                    onClick={handleCancelMembership}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                  >
                    Cancel Membership
                  </button>
                </div>
              </div>
            ) : null}

            {/* Expiration Warning */}
            {membership.expiresSoon && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Membership Expires Soon
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your membership will expire on {formatDate(membership.currentPeriodEnd)}. 
                      Make sure your payment method is up to date to continue enjoying all member benefits.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Join Membership CTA */}
        {!membership && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Not a Member Yet?
            </h2>
            <p className="text-gray-600 mb-6">
              Join Eklektik AF and enjoy exclusive benefits, discounts, and access to our amazing community of mums in Abu Dhabi.
            </p>
            <button
              onClick={() => router.push('/eklektikmamaMembership')}
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Join Eklektik AF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
