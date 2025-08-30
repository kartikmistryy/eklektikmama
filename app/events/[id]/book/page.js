'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import moment from 'moment';

export default function BookingPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guardianName: '',
    childName: '',
    email: '',
    phone: '',
    numberOfTickets: 1
  });

  // Fetch event data on component mount
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) {
          const eventData = await res.json();
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: params.id,
          ...formData
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#093166] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Event not found</h1>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#093166] text-white p-6">
            <h1 className="text-2xl md:text-3xl font-antonio uppercase">Book Your Tickets</h1>
            <p className="text-blue-100 mt-2">Complete your booking for {event.title}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Event Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Event Details</h2>
              
              {event.coverImage && (
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <Image 
                    src={event.coverImage} 
                    alt={event.title} 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#093166]">{event.title}</h3>
                
                {event.date && (
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📅</span>
                    <span>{moment(event.date).format("dddd, MMMM Do YYYY, h:mm A")}</span>
                  </div>
                )}
                
                {event.location && (
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                
                {event.price > 0 && (
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🎟️</span>
                    <span className="font-semibold">₹{event.price} per ticket</span>
                  </div>
                )}

                {event.description && (
                  <div className="text-gray-600 text-sm">
                    <p>{event.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Your Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian/Parent Name *
                  </label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                    placeholder="Enter guardian/parent name"
                  />
                </div>

                <div>
                  <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                    Child Name *
                  </label>
                  <input
                    type="text"
                    id="childName"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                    placeholder="Enter child name"
                  />
                </div>

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
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="numberOfTickets" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tickets *
                  </label>
                  <select
                    id="numberOfTickets"
                    name="numberOfTickets"
                    value={formData.numberOfTickets}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'ticket' : 'tickets'}</option>
                    ))}
                  </select>
                </div>

                {/* Total Price Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Amount:</span>
                    <span className="text-xl font-bold text-[#093166]">
                      ₹{(event.price * formData.numberOfTickets).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#093166] text-white py-3 px-6 rounded-md font-medium hover:bg-[#093166]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>

              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
