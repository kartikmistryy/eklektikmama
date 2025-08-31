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
      } else {
        setError('Booking not found');
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-8xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your payment was successful and your booking is confirmed.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Booking ID:</span>
                <span className="text-gray-800 font-mono text-sm">{booking._id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Guardian Name:</span>
                <span className="text-gray-800">{booking.guardianName}</span>
              </div>
              
              {booking.childName && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-600">Child Name:</span>
                  <span className="text-gray-800">{booking.childName}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Email:</span>
                <span className="text-gray-800">{booking.userEmail}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Phone:</span>
                <span className="text-gray-800">{booking.phone}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Tickets:</span>
                <span className="text-gray-800">{booking.numberOfTickets}</span>
              </div>
              
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

          {/* QR Code */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Entry QR Code</h2>
            <p className="text-gray-600 mb-4">Show this QR code at the event entrance for quick check-in.</p>
            
            {booking.qrCodeDataUrl ? (
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <Image 
                    src={booking.qrCodeDataUrl} 
                    alt="Entry QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">Scan this QR code for entry</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-2">📱</div>
                <p className="text-gray-500">QR Code not available</p>
              </div>
            )}
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
              <div className="text-green-500 text-4xl mb-2">📱</div>
              <h3 className="font-semibold text-gray-800 mb-1">Save QR Code</h3>
              <p className="text-sm text-gray-600">Screenshot this QR code for easy access</p>
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
