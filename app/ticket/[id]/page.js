"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const TicketDisplayPage = () => {
  const params = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch(`/api/ticket/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setTicketData(data.ticket);
        } else {
          setError(data.error || "Ticket not found");
        }
      } catch (err) {
        setError("Failed to load ticket information");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTicketData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e8e8e8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#db4e9f] mx-auto mb-4"></div>
          <p className="text-[#093166] font-medium">Loading ticket information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e8e8e8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <h2 className="font-bold text-lg mb-2">Ticket Not Found</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e8e8e8] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
            <h2 className="font-bold text-lg mb-2">No Ticket Data</h2>
            <p>Unable to retrieve ticket information.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e8e8e8] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#db4e9f] to-[#bf378b] text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Eklektik Mama</h1>
            <p className="text-lg opacity-90">Event Ticket</p>
          </div>

          {/* Ticket Content */}
          <div className="p-6">
            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-gray-50 rounded-xl">
                <Image
                  src={ticketData.qrCodeDataUrl}
                  alt="Ticket QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Scan this QR code for entry</p>
            </div>

            {/* Ticket Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#093166] mb-1">Ticket Number</h3>
                  <p className="text-2xl font-bold text-[#db4e9f]">#{ticketData.ticketNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#093166] mb-1">Transaction ID</h3>
                  <p className="text-sm font-mono text-gray-700 break-all">{ticketData.transactionId}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#093166] mb-2">Event Details</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Event:</span> {ticketData.eventTitle}</p>
                  <p><span className="font-medium">Date:</span> {new Date(ticketData.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#093166] mb-2">Guardian Information</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Name:</span> {ticketData.guardianName}</p>
                    <p><span className="font-medium">Email:</span> {ticketData.userEmail}</p>
                    {ticketData.phone && (
                      <p><span className="font-medium">Phone:</span> {ticketData.phone}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-[#093166] mb-2">Ticket Details</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Number of Tickets:</span> {ticketData.numberOfTickets}</p>
                    {ticketData.childName && (
                      <p><span className="font-medium">Child Name:</span> {ticketData.childName}</p>
                    )}
                    <p><span className="font-medium">Status:</span> 
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {ticketData.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-[#093166] mb-1">Booking Information</h3>
                <p><span className="font-medium">Booked on:</span> {new Date(ticketData.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                This is your official event ticket. Please keep it safe and present it at the event entrance.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                For any questions, contact us at info@eklektikmama.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketDisplayPage;
