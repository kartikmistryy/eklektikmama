"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EventsManagePage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const eventsData = await response.json();
        setEvents(eventsData);
      } else {
        alert("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      alert("Error loading events");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event._id);
    
    // Format dates for form inputs
    const startDate = new Date(event.date);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const bookingDeadline = event.bookingDeadline ? new Date(event.bookingDeadline) : null;
    
    setForm({
      title: event.title || "",
      description: event.description || "",
      coverImage: event.coverImage || "",
      date: startDate.toISOString().split('T')[0],
      startTime: event.startTime || "",
      endDate: endDate ? endDate.toISOString().split('T')[0] : "",
      endTime: event.endTime || "",
      price: event.price || "",
      location: event.location || "",
      segment: event.segment || "cinemaMorning",
      isMembersOnly: event.isMembersOnly || false,
      message: event.message || "",
      meetingLink: event.meetingLink || "",
      bookingDeadline: bookingDeadline ? bookingDeadline.toISOString().slice(0, 16) : "",
      seats: event.seats || "",
    });
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setForm({});
    setImageFile(null);
    setImagePreview("");
    setUploadMessage("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadMessage("❌ Please select an image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadMessage("❌ File size must be less than 5MB");
        return;
      }

      setImageFile(file);
      setUploadMessage("");

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async () => {
    if (!imageFile) {
      setUploadMessage("❌ Please select an image first");
      return;
    }

    setIsUploading(true);
    setUploadMessage("📤 Uploading to Cloudinary...");

    try {
      const base64String = await fileToBase64(imageFile);
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const uploadData = new FormData();
      uploadData.append('file', base64String);
      uploadData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      uploadData.append('folder', 'eklektikmama/events');

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
      }

      const result = await response.json();
      setForm({ ...form, coverImage: result.secure_url });
      setUploadMessage("✅ Image uploaded successfully to Cloudinary!");
      
      setTimeout(() => {
        setImageFile(null);
        setImagePreview("");
        setUploadMessage("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);

    } catch (error) {
      setUploadMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setSaving(true);
    
    if (!form.coverImage) {
      alert("❌ Please upload a cover image first");
      setSaving(false);
      return;
    }

    // Process form data
    let eventData = { ...form };
    
    if (form.date && form.startTime) {
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      eventData.date = startDateTime.toISOString();
    }
    
    if (form.endDate && form.endTime) {
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
      eventData.endDate = endDateTime.toISOString();
    } else if (form.date && form.startTime && !form.endDate) {
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000));
      eventData.endDate = endDateTime.toISOString();
    }

    if (form.bookingDeadline) {
      eventData.bookingDeadline = new Date(form.bookingDeadline).toISOString();
    }

    if (form.seats) {
      eventData.seats = parseInt(form.seats);
    }

    if (form.price) {
      eventData.price = parseFloat(form.price);
    }
    
    if (form.segment === 'coffeeMeetup') {
      eventData.isMembersOnly = true;
    }

    try {
      const res = await fetch(`/api/events/${editingEvent}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      
      if (res.ok) {
        alert("✅ Event updated successfully!");
        setEditingEvent(null);
        setForm({});
        setImageFile(null);
        setImagePreview("");
        setUploadMessage("");
        fetchEvents();
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to update event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("❌ Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId, eventTitle) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully");
        fetchEvents();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSegmentColor = (segment) => {
    const colors = {
      cinemaMorning: 'bg-purple-100 text-purple-800',
      mamaBreakfast: 'bg-pink-100 text-pink-800',
      mamaFit: 'bg-green-100 text-green-800',
      eklektikEdit: 'bg-blue-100 text-blue-800',
      familyDay: 'bg-orange-100 text-orange-800',
      coffeeMeetup: 'bg-gray-100 text-gray-800'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  };

  const getSegmentName = (segment) => {
    const names = {
      cinemaMorning: 'Cinema Morning',
      mamaBreakfast: 'Mama Breakfast',
      mamaFit: 'MamaFit',
      eklektikEdit: 'Eklektik Edit',
      familyDay: 'Family Day',
      coffeeMeetup: 'Coffee Meetup'
    };
    return names[segment] || segment;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push("/admin/events/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Event
          </button>
          <button 
            onClick={() => router.push("/admin")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Admin
          </button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No events found</p>
          <button 
            onClick={() => router.push("/admin/events/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {editingEvent === event._id ? (
                // Edit Mode
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                        <input 
                          name="title" 
                          value={form.title} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          required 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Segment *</label>
                        <select 
                          name="segment" 
                          value={form.segment} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="cinemaMorning">Cinema Morning</option>
                          <option value="mamaBreakfast">Mama Breakfast</option>
                          <option value="mamaFit">MamaFit</option>
                          <option value="eklektikEdit">Eklektik Edit</option>
                          <option value="familyDay">Family Day</option>
                          <option value="coffeeMeetup">Coffee Meetup (Members Only)</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isMembersOnly"
                          checked={form.isMembersOnly}
                          onChange={(e) => setForm({ ...form, isMembersOnly: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Members Only Event
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          rows={3}
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      </div>

                      {/* Eklektik Edit specific fields */}
                      {form.segment === "eklektikEdit" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message</label>
                            <textarea 
                              name="message" 
                              value={form.message} 
                              onChange={handleChange} 
                              rows={2}
                              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                            <input 
                              name="meetingLink" 
                              value={form.meetingLink} 
                              onChange={handleChange} 
                              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            />
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                          <input 
                            type="date" 
                            name="date" 
                            value={form.date} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            required 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                          <input 
                            type="text" 
                            name="startTime" 
                            value={form.startTime} 
                            onChange={handleChange} 
                            placeholder="e.g., 10:00 AM"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input 
                            type="date" 
                            name="endDate" 
                            value={form.endDate} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input 
                            type="text" 
                            name="endTime" 
                            value={form.endTime} 
                            onChange={handleChange} 
                            placeholder="e.g., 12:00 PM"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
                          <input 
                            type="number" 
                            name="price" 
                            value={form.price} 
                            onChange={handleChange} 
                            step="0.01"
                            min="0"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                          <input 
                            type="number" 
                            name="seats" 
                            value={form.seats} 
                            onChange={handleChange} 
                            min="1"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input 
                            name="location" 
                            value={form.location} 
                            onChange={handleChange} 
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Booking Deadline</label>
                        <input 
                          type="datetime-local" 
                          name="bookingDeadline" 
                          value={form.bookingDeadline} 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        />
                      </div>
                    </div>

                    {/* Right Column - Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image *</label>
                      
                      {/* Current Image Display */}
                      {form.coverImage && (
                        <div className="mb-4">
                          <div className="relative inline-block">
                            <Image
                              src={form.coverImage}
                              alt="Cover preview"
                              width={200}
                              height={150}
                              className="rounded-lg object-cover border"
                            />
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Current image
                          </p>
                        </div>
                      )}

                      {/* File Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        {!imagePreview ? (
                          <div>
                            <div className="text-gray-400 mb-2">
                              <svg className="mx-auto h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-blue-600 hover:text-blue-500 font-medium"
                              >
                                Click to upload new image
                              </button>
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        ) : (
                          <div>
                            <div className="relative inline-block mb-4">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                width={200}
                                height={150}
                                className="rounded-lg object-cover border"
                              />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              Selected: {imageFile?.name} ({(imageFile?.size / 1024 / 1024).toFixed(2)}MB)
                            </p>
                            <button
                              type="button"
                              onClick={uploadToCloudinary}
                              disabled={isUploading}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUploading ? "Uploading..." : "Upload to Cloudinary"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Upload Message */}
                      {uploadMessage && (
                        <div className={`mt-3 p-3 rounded-md text-sm ${
                          uploadMessage.includes("✅") 
                            ? "bg-green-50 text-green-800 border border-green-200" 
                            : uploadMessage.includes("❌")
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}>
                          {uploadMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      disabled={!form.coverImage || isUploading || saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex">
                  {/* Event Image */}
                  <div className="relative w-48 h-48 flex-shrink-0">
                    <Image
                      src={event.coverImage}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSegmentColor(event.segment)}`}>
                        {getSegmentName(event.segment)}
                      </span>
                    </div>
                    {event.isMembersOnly && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Members Only
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-xl mb-2">{event.title}</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.date)}
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          
                          {event.price !== undefined && event.price !== null && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              {event.price === 0 ? 'Free' : `${event.price} AED`}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {event.seats} seats available
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(event)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => router.push(`/events/${event._id}`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => handleDelete(event._id, event.title)}
                        disabled={deleting === event._id}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === event._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



