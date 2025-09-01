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

  // Fetch event data on component mount
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        if (res.ok) {
          const eventData = await res.json();
          setEvent(eventData);
          
          // Set form configuration based on event segment
          if (eventData.segment) {
            const config = getFormBySegment(eventData.segment);
            setFormConfig(config);
          }
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
      // Map form field names to API expected field names
      const mappedData = {
        eventId: params.id,
        eventSegment: event.segment,
        // Map motherName to guardianName
        guardianName: formData.motherName || formData.name || '',
        // Map motherEmail to email
        email: formData.motherEmail || formData.email || '',
        // Map motherPhone to phone
        phone: formData.motherPhone || formData.contact || '',
        // Keep childName as is
        childName: formData.childName || '',
        // Keep numberOfTickets as is
        numberOfTickets: formData.numberOfTickets || 1,
        // Pass all other form data as additionalData
        ...formData
      };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingTop: '10em' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#093166] text-white p-6">
            <h1 className="text-2xl md:text-3xl font-antonio uppercase">Book Your Tickets</h1>
            <p className="text-blue-100 mt-2">Complete your booking for {event.title}</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Event Details - Full Width at Top */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.coverImage && (
                  <div className="relative h-64 rounded-lg overflow-hidden">
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
                      <span className="text-lg">{moment(event.date).format("dddd, MMMM Do YYYY, h:mm A")}</span>
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
                      <span className="text-xl font-semibold text-[#093166]">AED {event.price} per ticket</span>
                    </div>
                  )}

                  {event.description && (
                    <div className="text-gray-600">
                      <p className="text-base leading-relaxed">{event.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
