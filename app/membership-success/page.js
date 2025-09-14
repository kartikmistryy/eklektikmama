'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MembershipSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('Missing payment information');
          setLoading(false);
          return;
        }

        // Verify payment and get membership details
        const response = await fetch('/api/membership/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          setResult(data);
        } else {
          setError(data.error || 'Failed to verify payment');
        }
      } catch (err) {
        setError('An error occurred while verifying your payment');
        console.error('Payment verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#db4e9f] mx-auto mb-4"></div>
          <p className="text-[#093166] font-quicksand">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-[#093166] mb-4 font-antonio">Payment Verification Failed</h1>
          <p className="text-[#093166] font-quicksand mb-6">{error}</p>
          <button
            onClick={() => router.push('/eklektikmamaMembership')}
            className="bg-[#db4e9f] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#bf378b] transition-colors duration-300 font-antonio"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-[#093166] mb-4 font-antonio">Welcome to Eklektik AF!</h1>
        <p className="text-[#093166] font-quicksand mb-6">
          Your {result.membership.membershipType} membership is now active!
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-bold text-[#093166] mb-2">Membership Details:</h3>
          <p><strong>Email:</strong> {result.membership.email}</p>
          <p><strong>Type:</strong> {result.membership.membershipType}</p>
          <p><strong>Status:</strong> {result.membership.status}</p>
          <p><strong>Valid Until:</strong> {new Date(result.membership.currentPeriodEnd).toLocaleDateString()}</p>
        </div>

        {result.googleSheets && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {result.googleSheets.success ? '✅ Added to member database' : '⚠️ Database update pending'}
            </p>
          </div>
        )}

        {result.email && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {result.email.success ? '✅ Welcome email sent' : '⚠️ Email sending pending'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/member-dashboard')}
            className="w-full bg-[#db4e9f] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#bf378b] transition-colors duration-300 font-antonio"
          >
            Go to Member Dashboard
          </button>
          <button
            onClick={() => router.push('/events')}
            className="w-full bg-[#093166] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#1e4a72] transition-colors duration-300 font-antonio"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function MembershipSuccessLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#db4e9f] mx-auto mb-4"></div>
        <p className="text-[#093166] font-quicksand">Loading...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function MembershipSuccess() {
  return (
    <Suspense fallback={<MembershipSuccessLoading />}>
      <MembershipSuccessContent />
    </Suspense>
  );
}
