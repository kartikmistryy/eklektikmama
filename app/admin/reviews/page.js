"use client";

import { useState, useEffect } from 'react';
import { BsFillStarFill, BsStar, BsPencilSquare, BsTrash, BsPlus } from 'react-icons/bs';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    stars: 5,
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingReview ? `/api/reviews/${editingReview._id}` : '/api/reviews';
      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
        setShowAddForm(false);
        setEditingReview(null);
        setFormData({
          text: '',
          stars: 5,
          isActive: true,
          displayOrder: 0
        });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Error saving review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      text: review.text,
      stars: review.stars,
      isActive: review.isActive,
      displayOrder: review.displayOrder
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchReviews();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <BsFillStarFill
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
              <button
                onClick={() => {
                  setShowAddForm(true);
                  setEditingReview(null);
                  setFormData({
                    text: '',
                    stars: 5,
                    isActive: true,
                    displayOrder: 0
                  });
                }}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 flex items-center gap-2"
              >
                <BsPlus className="text-lg" />
                Add Review
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Text
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                    maxLength={500}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.text.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stars
                    </label>
                    <select
                      value={formData.stars}
                      onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value={1}>1 Star</option>
                      <option value={2}>2 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={5}>5 Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      min="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                  >
                    {editingReview ? 'Update Review' : 'Add Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingReview(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {renderStars(review.stars)}
                          </div>
                          <span className="text-sm text-gray-500">
                            Order: {review.displayOrder}
                          </span>
                          {review.isActive ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">&quot;{review.text}&quot;</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <BsPencilSquare className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <BsTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
