import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";
import moment from "moment";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getBookings() {
  await connectDB();
  const bookings = await Booking.find({})
    .populate('eventId')
    .sort({ createdAt: -1 })
    .lean();
  return bookings;
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#093166] text-white p-6">
            <h1 className="text-2xl md:text-3xl font-antonio uppercase">All Bookings</h1>
            <p className="text-blue-100 mt-2">Total Bookings: {bookings.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guardian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {moment(booking.createdAt).format('MMM D, YYYY h:mm A')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.eventId?.title || 'Event not found'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.guardianName || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.childName || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.userEmail || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.phone || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.numberOfTickets || 1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.ticketNumber ? (
                        <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-[#db4e9f] text-white">
                          #{booking.ticketNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-xs">🎫</span>
                        <a 
                          href={`/ticket/${booking._id}`}
                          target="_blank"
                          className="text-[#db4e9f] hover:text-[#bf378b] text-xs underline"
                        >
                          View
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        {booking.transactionId?.substring(0, 20)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>

        {/* Test Google Sheets Integration */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white p-6">
            <h2 className="text-xl font-bold">Test Google Sheets Integration</h2>
            <p className="text-green-100 mt-2">Click the button below to test if data is being added to your spreadsheet</p>
          </div>
          <div className="p-6">
            <a 
              href="/api/test-sheets" 
              target="_blank"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Test Google Sheets
            </a>
            <p className="text-sm text-gray-600 mt-2">
              This will add a test row to your Google Sheet to verify the integration is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
