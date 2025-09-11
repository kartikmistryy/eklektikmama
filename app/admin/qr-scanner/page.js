"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const QRScannerPage = () => {
  const [qrData, setQrData] = useState("");
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQRScan = async () => {
    if (!qrData.trim()) {
      setError("Please enter QR code data");
      return;
    }

    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      const response = await fetch('/api/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (data.success) {
        setTicketInfo(data.ticket);
      } else {
        setError(data.error || "Failed to process QR code");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (transactionId) => {
    if (!transactionId.trim()) {
      setError("Please enter transaction ID");
      return;
    }

    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      // Create a mock QR data with just transaction ID
      const mockQrData = JSON.stringify({
        transactionId: transactionId.trim()
      });

      const response = await fetch('/api/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData: mockQrData }),
      });

      const data = await response.json();

      if (data.success) {
        setTicketInfo(data.ticket);
      } else {
        setError(data.error || "Failed to find ticket");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f6f6] to-[#e8e8e8] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#093166] to-[#db4e9f] text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">QR Code Scanner</h1>
            <p className="text-lg opacity-90">Event Entry Verification</p>
          </div>

          <div className="p-6">
            {/* QR Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Data
              </label>
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Paste QR code data here or scan QR code..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#db4e9f] focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleQRScan}
                disabled={loading}
                className="mt-3 w-full bg-[#db4e9f] text-white py-2 px-4 rounded-lg hover:bg-[#bf378b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Verify QR Code"}
              </button>
            </div>

            {/* Manual Entry */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-[#093166] mb-2">Manual Entry</h3>
              <p className="text-sm text-gray-600 mb-3">Enter transaction ID if QR code is not available</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Transaction ID"
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#db4e9f] focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualEntry(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    handleManualEntry(input.value);
                  }}
                  disabled={loading}
                  className="bg-[#093166] text-white py-2 px-4 rounded hover:bg-[#0a3d7a] transition-colors disabled:opacity-50"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            )}

            {/* Ticket Information */}
            {ticketInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-green-800">Valid Ticket</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-[#093166] mb-2">Ticket Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Ticket #:</span> 
                        <span className="ml-1 px-2 py-1 bg-[#db4e9f] text-white rounded-full text-xs font-bold">
                          #{ticketInfo.ticketNumber}
                        </span>
                      </p>
                      <p><span className="font-medium">Transaction ID:</span> {ticketInfo.transactionId}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                          ticketInfo.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ticketInfo.isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#093166] mb-2">Event Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Event:</span> {ticketInfo.eventTitle}</p>
                      <p><span className="font-medium">Date:</span> {new Date(ticketInfo.eventDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Tickets:</span> {ticketInfo.numberOfTickets}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#093166] mb-2">Guardian Information</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {ticketInfo.guardianName}</p>
                      <p><span className="font-medium">Email:</span> {ticketInfo.userEmail}</p>
                      {ticketInfo.phone && <p><span className="font-medium">Phone:</span> {ticketInfo.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#093166] mb-2">Additional Info</h3>
                    <div className="space-y-1 text-sm">
                      {ticketInfo.childName && <p><span className="font-medium">Child:</span> {ticketInfo.childName}</p>}
                      <p><span className="font-medium">Booked:</span> {new Date(ticketInfo.createdAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Photography:</span> {ticketInfo.photographyConsent}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700">
                      <strong>Entry Status:</strong> {ticketInfo.isValid ? 'Approved for entry' : 'Not approved'}
                    </p>
                    <button
                      onClick={() => {
                        setTicketInfo(null);
                        setQrData("");
                        setError(null);
                      }}
                      className="bg-[#093166] text-white px-4 py-2 rounded hover:bg-[#0a3d7a] transition-colors text-sm"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QRScannerPage;
