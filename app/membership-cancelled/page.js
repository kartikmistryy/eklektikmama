'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MembershipCancelled() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const successParam = searchParams.get('success');
    setSuccess(successParam === 'true');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {success ? (
            <>
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Membership Cancelled
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Your membership cancellation has been confirmed successfully.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-lg font-semibold text-orange-800 mb-3">
                  ⚠️ Important Information
                </h2>
                <ul className="text-orange-700 space-y-2">
                  <li>• Your membership will remain active until the end of your current billing period</li>
                  <li>• You can continue enjoying all member benefits until then</li>
                  <li>• You can reactivate your membership anytime before the period ends</li>
                  <li>• A confirmation email has been sent to your registered email address</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-lg font-semibold text-blue-800 mb-3">
                  🔄 Want to Reactivate?
                </h2>
                <p className="text-blue-700 mb-4">
                  If you change your mind, you can reactivate your membership by visiting your Member Dashboard.
                </p>
                <button
                  onClick={() => router.push('/member-dashboard')}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Go to Member Dashboard
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/events')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </button>
                <button
                  onClick={() => router.push('/contactus')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Cancellation Failed
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  There was an issue processing your cancellation request.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-red-800 mb-3">
                  Possible Reasons:
                </h2>
                <ul className="text-red-700 space-y-2">
                  <li>• The verification link has expired</li>
                  <li>• The link has already been used</li>
                  <li>• Your membership is no longer active</li>
                  <li>• There was a technical error</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/member-dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push('/contactus')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
