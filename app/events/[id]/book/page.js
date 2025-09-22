'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import moment from 'moment';
import { getFormBySegment } from '@/lib/eventForms';
// import { getFormBySegment } from '../../../lib/eventForms';
import DynamicForm from './components/DynamicForm';

export default function BookingPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [formConfig, setFormConfig] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [isEventPast, setIsEventPast] = useState(false);
  const [isBookingDeadlinePassed, setIsBookingDeadlinePassed] = useState(false);

  // Fetch event data on component mount
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) {
          const eventData = await res.json();
          setEvent(eventData);
          
          // Check if event date has passed
          const past = eventData.date ? moment(eventData.date).isBefore(moment(), 'day') : false;
          setIsEventPast(past);
          
          // Check if booking deadline has passed
          const deadlinePassed = eventData.bookingDeadline ? moment(eventData.bookingDeadline).isBefore(moment()) : false;
          setIsBookingDeadlinePassed(deadlinePassed);
          
          // Set form configuration based on event segment
          if (eventData.segment) {
            const config = getFormBySegment(eventData.segment);
            setFormConfig(config);
          }
        }
        
        // Fetch availability
        const availabilityRes = await fetch(`/api/events/${params.id}/availability`);
        if (availabilityRes.ok) {
          const availabilityData = await availabilityRes.json();
          setAvailability(availabilityData);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [params.id]);



  const handleFormSubmit = async (formData) => {
    setSubmitting(true);

    try {
      // Check if event has passed
      if (isEventPast) {
        alert('Sorry, this event has already passed and bookings are no longer available.');
        setSubmitting(false);
        return;
      }
      
      // Check if booking deadline has passed
      if (isBookingDeadlinePassed) {
        alert('Sorry, the booking deadline for this event has passed. Bookings are no longer available.');
        setSubmitting(false);
        return;
      }
      
      // Check if event is still available
      if (availability && !availability.available) {
        alert('Sorry, this event is now fully booked. Please try another event.');
        setSubmitting(false);
        return;
      }
      // Map form field names to API expected field names
      const mappedData = {
        eventId: params.id,
        eventSegment: event.segment,
        // Map parent names to guardianName (handle different form structures)
        guardianName: formData.motherName || formData.parent1Name || formData.name || '',
        // Map parent emails to email
        email: formData.motherEmail || formData.parentEmail || formData.email || '',
        // Map parent phones to phone
        phone: formData.motherPhone || formData.parent1Phone || formData.contact || '',
        // Keep childName as is (or use first child for family day)
        childName: formData.childName || formData.child1Name || '',
        // Keep numberOfTickets as is
        numberOfTickets: formData.numberOfTickets || 1,
        // Pass all other form data as additionalData
        ...formData
      };

      // Debug logging for form submission
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Original formData:', formData);
      console.log('Mapped data:', mappedData);
      console.log('Event segment:', event.segment);
      console.log('Choice I:', formData.choiceI);
      console.log('Choice II:', formData.choiceII);
      console.log('Choice III:', formData.choiceIII);

      // Proceed directly to payment - data will be saved after successful payment
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedData),
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

  // Check if event has passed
  if (isEventPast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-gray-500 text-6xl mb-4">📅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Has Passed</h1>
            <p className="text-gray-600 mb-4">
              Sorry, {event.title} has already occurred and bookings are no longer available.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check out our upcoming events for future bookings.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/events')} 
                className="w-full px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90"
              >
                View Other Events
              </button>
              <button 
                onClick={() => router.back()} 
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if booking deadline has passed
  if (isBookingDeadlinePassed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="text-orange-500 text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Deadline Passed</h1>
            <p className="text-gray-600 mb-4">
              Sorry, the booking deadline for {event.title} has passed and bookings are no longer available.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check out our other events for future bookings.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/events')} 
                className="w-full px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90"
              >
                View Other Events
              </button>
              <button 
                onClick={() => router.back()} 
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if event is fully booked
  if (availability && !availability.available) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Fully Booked</h1>
            <p className="text-gray-600 mb-4">
              Sorry, {event.title} has reached its maximum capacity of {availability.total} tickets.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check back later or explore other available events.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/events')} 
                className="w-full px-4 py-2 bg-[#093166] text-white rounded-md hover:bg-[#093166]/90"
              >
                View Other Events
              </button>
              <button 
                onClick={() => router.back()} 
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingTop: '10em' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#093166] text-white p-6">
            <h1 className="text-2xl md:text-3xl font-antonio uppercase">Book Your Tickets</h1>
            <p className="text-blue-100 mt-2">Complete your booking for {event.title}</p>
            {availability && (
              <div className="mt-3 text-sm text-blue-200">
                {isEventPast 
                  ? "Event has passed" 
                  : `${availability.remaining} of ${availability.total} tickets remaining`
                }
              </div>
            )}
          </div>

          <div className="p-6 space-y-8">
            {/* Event Details - Cover Photo Left, Details Right */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.coverImage && (
                  <div className="relative h-80 rounded-lg overflow-hidden">
                    <Image 
                      src={event.coverImage} 
                      alt={event.title} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-[#093166]">{event.title}</h3>
                  
                  {event.date && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl">📅</span>
                      <span className="text-lg">
                        {moment(event.date).format("dddd, MMMM Do YYYY")}
                      </span>
                    </div>
                  )}
                  
                  {event.startTime && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl">🕐</span>
                      <span className="text-lg font-semibold text-[#093166]">
                        {event.endTime && event.endTime !== event.startTime
                          ? `Time: ${moment(`2000-01-01T${event.startTime}`).format("h:mm A")} - ${moment(`2000-01-01T${event.endTime}`).format("h:mm A")}`
                          : `Start Time: ${moment(`2000-01-01T${event.startTime}`).format("h:mm A")}`
                        }
                      </span>
                    </div>
                  )}
                  
                  {event.endDate && event.endDate !== event.date && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl">📅</span>
                      <span className="text-lg">
                        End: {moment(event.endDate).format("dddd, MMMM Do YYYY")}
                      </span>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl">📍</span>
                      <span className="text-lg">{event.location}</span>
                    </div>
                  )}
                  
                  {event.price > 0 && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-3 text-xl">🎟️</span>
                      {event.segment === 'familyDay' ? (
                        <div>
                          <span className="text-xl font-semibold text-[#093166]">Family Day Pricing (Test):</span>
                          <div className="mt-2 space-y-1 text-sm">
                            <div>• Parents + 2 children: <span className="font-semibold text-[#093166]">3.6 AED</span></div>
                            <div>• Parents + 3 children: <span className="font-semibold text-[#093166]">3.8 AED</span></div>
                            <div>• Parents + 4 children: <span className="font-semibold text-[#093166]">4.0 AED</span></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xl font-semibold text-[#093166]">AED {event.price} per ticket</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section - Below Both Cover and Details */}
            {event.description && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                <p className="text-base text-gray-800 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Information</h2>
              
              {formConfig ? (
                <DynamicForm
                  formConfig={formConfig}
                  onSubmit={handleFormSubmit}
                  submitting={submitting}
                  event={event}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading form...</p>
                </div>
              )}

              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors font-medium"
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
