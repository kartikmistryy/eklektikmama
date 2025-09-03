"use client";
import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDeletePanel() {
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Fetch events and highlights
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await fetch('/api/admin/events');
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Fetch highlights
      const highlightsResponse = await fetch('/api/admin/highlights');
      const highlightsData = await highlightsResponse.json();
      setHighlights(highlightsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('❌ Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, item) => {
    setItemToDelete({ type, item });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      setMessage('');

      const { type, item } = itemToDelete;
      let response;

      if (type === 'event') {
        response = await fetch(`/api/admin/events/${item._id}`, {
          method: 'DELETE',
        });
      } else if (type === 'highlight') {
        response = await fetch(`/api/admin/highlights/${item._id}`, {
          method: 'DELETE',
        });
      }

      if (response.ok) {
        setMessage(`✅ ${type === 'event' ? 'Event' : 'Highlight'} deleted successfully!`);
        
        // Remove from local state
        if (type === 'event') {
          setEvents(prev => prev.filter(e => e._id !== item._id));
        } else {
          setHighlights(prev => prev.filter(h => h._id !== item._id));
        }

        // Refresh data after a short delay
        setTimeout(() => {
          fetchData();
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Error deleting ${type}: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage(`❌ Error deleting ${itemToDelete.type}: ${error.message}`);
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete Panel</h1>
          <p className="text-gray-600">⚠️ Warning: This action cannot be undone. Please be careful when deleting items.</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Safety Notes:</strong>
              <br />• Deleted items are permanently removed from the database
              <br />• Associated bookings and data will also be affected
              <br />• Consider archiving instead of deleting if you need to preserve data
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center space-x-2 ${
          message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 
          message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' : 
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.includes('✅') ? <CheckCircle className="w-5 h-5" /> : 
           message.includes('❌') ? <XCircle className="w-5 h-5" /> : 
           <AlertTriangle className="w-5 h-5" />}
          <span>{message}</span>
        </div>
      )}

      {/* Events Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
          Events ({events.length})
        </h2>
        
        {events.length === 0 ? (
          <p className="text-gray-500 italic">No events found.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(event.date).toLocaleDateString()} • {event.segment} • {event.location}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Price: AED {event.price} • Created: {new Date(event.createdAt).toLocaleDateString()}
                      {event.updatedAt && event.updatedAt !== event.createdAt && 
                        ` • Updated: ${new Date(event.updatedAt).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete('event', event)}
                    disabled={deleting}
                    className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
          Highlights ({highlights.length})
        </h2>
        
        {highlights.length === 0 ? (
          <p className="text-gray-500 italic">No highlights found.</p>
        ) : (
          <div className="space-y-4">
            {highlights.map((highlight) => (
              <div key={highlight._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{highlight.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{highlight.description}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Photos: {highlight.photos.length} • Created: {new Date(highlight.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete('highlight', highlight)}
                    disabled={deleting}
                    className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete highlight"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {itemToDelete.type}? 
              <br />
              <strong className="text-gray-900">
                "{itemToDelete.item.title || itemToDelete.item.name}"
              </strong>
              <br />
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
