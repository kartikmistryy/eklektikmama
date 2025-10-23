"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverImage: "",
    date: "",
    startTime: "",
    endDate: "",
    endTime: "",
    price: "",
    location: "",
    segment: "cinemaMorning",
    isMembersOnly: false,
    message: "",
    meetingLink: "",
    bookingDeadline: "",
    seats: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (!form.coverImage) {
      alert("❌ Please upload a cover image first");
      setSaving(false);
      return;
    }

    if (!form.title || !form.date || !form.startTime || !form.seats) {
      alert("❌ Please fill in all required fields");
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
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      
      if (res.ok) {
        alert("✅ Event created successfully!");
        router.push("/admin/events/manage");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to create event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("❌ Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push("/admin/events/manage")}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Back to Events
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
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
                placeholder="Enter event title"
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
                <option value="festiveMornings">Festive Mornings</option>
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
                placeholder="Enter event description"
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
                    placeholder="Enter custom message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <input 
                    name="meetingLink" 
                    value={form.meetingLink} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter meeting link"
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
                  placeholder="0.00"
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
                  placeholder="50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  name="location" 
                  value={form.location} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location"
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
                      Click to upload image
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
            type="submit"
            disabled={!form.coverImage || isUploading || saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Event"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/events/manage")}
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
