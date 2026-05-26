'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function BookingSuccessPage({ params }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        trackPurchase(data);
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  // Push purchase event to GTM dataLayer; GTM forwards to Meta Pixel.
  // Refresh-dedup keyed on booking._id so reloading this page doesn't re-fire.
  const trackPurchase = (data) => {
    if (typeof window === 'undefined' || !data?._id) return;
    const dedupKey = `purchase_tracked_${data._id}`;
    if (sessionStorage.getItem(dedupKey)) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      booking_id: data._id,
      transaction_id: data.transactionId,
      value: data.totalAmount ?? 0,
      currency: data.currency || 'AED',
      event_id: data.eventId,
      event_name: data.eventTitle,
      num_tickets: data.numberOfTickets,
      email: data.userEmail,
    });

    sessionStorage.setItem(dedupKey, '1');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600">{error}</p>
          <Link href="/events" className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h1>
          <p className="text-gray-600">We couldn&apos;t find your booking details.</p>
          <Link href="/events" className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12" style={{ paddingTop: '10em' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your payment was successful and your booking is confirmed.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Booking ID:</span>
              <span className="text-gray-800 font-mono text-sm">{booking._id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Email:</span>
              <span className="text-gray-800">{booking.userEmail}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Guardian/Parent Name:</span>
              <span className="text-gray-800">{booking.guardianName || booking.memberName || 'Not provided'}</span>
            </div>
            
            {booking.childName && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Child Name:</span>
                <span className="text-gray-800">{booking.childName}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Tickets:</span>
              <span className="text-gray-800">{booking.numberOfTickets}</span>
            </div>
            
            {booking.isMember && (
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Member Savings:</span>
                <span className="text-green-600 font-semibold">AED {booking.memberSavings || 0}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Transaction ID:</span>
              <span className="text-gray-800 font-mono text-sm">{booking.transactionId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">{booking.paymentStatus}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What&apos;s Next?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-blue-500 text-4xl mb-2">📧</div>
              <h3 className="font-semibold text-gray-800 mb-1">Email Confirmation</h3>
              <p className="text-sm text-gray-600">Check your email for booking confirmation</p>
            </div>
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-2">🎫</div>
              <h3 className="font-semibold text-gray-800 mb-1">Entry Information</h3>
              <p className="text-sm text-gray-600">Bring your booking details for event entry</p>
            </div>
            <div className="text-center">
              <div className="text-purple-500 text-4xl mb-2">🎉</div>
              <h3 className="font-semibold text-gray-800 mb-1">Get Ready!</h3>
              <p className="text-sm text-gray-600">We can&apos;t wait to see you at the event</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Link 
            href="/events" 
            className="inline-block bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            Browse More Events
          </Link>
          <button 
            onClick={() => window.print()} 
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-md hover:bg-pink-600 transition-colors"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
