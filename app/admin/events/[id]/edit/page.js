"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditEventPage({ params }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
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
    menuSelections: [
      { label: "", options: [] },
      { label: "", options: [] },
      { label: "", options: [] }
    ],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`);
        if (response.ok) {
          const eventData = await response.json();
          setEvent(eventData);
          
          // Format dates for form inputs
          const startDate = new Date(eventData.date);
          const endDate = eventData.endDate ? new Date(eventData.endDate) : null;
          const bookingDeadline = eventData.bookingDeadline ? new Date(eventData.bookingDeadline) : null;
          
          // Initialize menu selections - ensure we have 3, fill with empty if needed
          const existingMenuSelections = eventData.menuSelections || [];
          const menuSelections = [
            existingMenuSelections[0] || { label: "", options: [] },
            existingMenuSelections[1] || { label: "", options: [] },
            existingMenuSelections[2] || { label: "", options: [] }
          ];
          
          setForm({
            title: eventData.title || "",
            description: eventData.description || "",
            coverImage: eventData.coverImage || "",
            date: startDate.toISOString().split('T')[0],
            startTime: eventData.startTime || "",
            endDate: endDate ? endDate.toISOString().split('T')[0] : "",
            endTime: eventData.endTime || "",
            price: eventData.price || "",
            location: eventData.location || "",
            segment: eventData.segment || "cinemaMorning",
            isMembersOnly: eventData.isMembersOnly || false,
            message: eventData.message || "",
            meetingLink: eventData.meetingLink || "",
            bookingDeadline: bookingDeadline ? bookingDeadline.toISOString().slice(0, 16) : "",
            seats: eventData.seats || "",
            menuSelections: menuSelections,
          });
        } else {
          alert("Failed to load event");
          router.push("/admin/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        alert("Error loading event");
        router.push("/admin/events");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEvent();
    }
  }, [params.id, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle menu selection changes
  const handleMenuSelectionLabelChange = (index, value) => {
    const newMenuSelections = [...form.menuSelections];
    newMenuSelections[index] = { ...newMenuSelections[index], label: value };
    setForm({ ...form, menuSelections: newMenuSelections });
  };

  const handleMenuOptionAdd = (menuIndex) => {
    const newMenuSelections = [...form.menuSelections];
    newMenuSelections[menuIndex].options.push("");
    setForm({ ...form, menuSelections: newMenuSelections });
  };

  const handleMenuOptionChange = (menuIndex, optionIndex, value) => {
    const newMenuSelections = [...form.menuSelections];
    newMenuSelections[menuIndex].options[optionIndex] = value;
    setForm({ ...form, menuSelections: newMenuSelections });
  };

  const handleMenuOptionRemove = (menuIndex, optionIndex) => {
    const newMenuSelections = [...form.menuSelections];
    newMenuSelections[menuIndex].options.splice(optionIndex, 1);
    setForm({ ...form, menuSelections: newMenuSelections });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadMessage("❌ Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadMessage("❌ File size must be less than 5MB");
        return;
      }

      setImageFile(file);
      setUploadMessage("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-blue-500", "bg-blue-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-500", "bg-blue-50");
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage("❌ File size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setUploadMessage("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadMessage("❌ Please drop an image file");
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
      // Convert file to base64 for Cloudinary
      const base64String = await fileToBase64(imageFile);
      
      // Upload to Cloudinary
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
      
      // Update form with Cloudinary URL
      setForm({ ...form, coverImage: result.secure_url });
      setUploadMessage("✅ Image uploaded successfully to Cloudinary!");
      
      // Clear the file input and preview after successful upload
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

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm({ ...form, coverImage: "" });
    setUploadMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    if (!form.coverImage) {
      alert("❌ Please upload a cover image first");
      setSaving(false);
      return;
    }

    // Combine date and time into proper datetime objects
    let eventData = { ...form };
    
    if (form.date && form.startTime) {
      // Combine start date and time
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      eventData.date = startDateTime.toISOString();
    }
    
    if (form.endDate && form.endTime) {
      // Combine end date and time
      const endDateTime = new Date(`${form.endDate}T${form.endTime}`);
      eventData.endDate = endDateTime.toISOString();
    } else if (form.date && form.startTime && !form.endDate) {
      // If no end date/time, set end time to start time + 2 hours (default)
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + (2 * 60 * 60 * 1000)); // +2 hours
      eventData.endDate = endDateTime.toISOString();
    }

    // Process booking deadline
    if (form.bookingDeadline) {
      eventData.bookingDeadline = new Date(form.bookingDeadline).toISOString();
    }

    // Convert seats to number
    if (form.seats) {
      eventData.seats = parseInt(form.seats);
    }

    // Convert price to number
    if (form.price) {
      eventData.price = parseFloat(form.price);
    }
    
    // Automatically set coffee meetup events as members-only
    if (form.segment === 'coffeeMeetup') {
      eventData.isMembersOnly = true;
    }

    // Filter out empty menu selections - only keep menus with both label and at least one option
    if (form.segment === 'mamaBreakfast' || form.segment === 'festiveMornings') {
      eventData.menuSelections = form.menuSelections
        .map(menu => ({
          label: (menu.label || '').trim(),
          options: (menu.options || []).filter(opt => opt && opt.trim() !== '')
        }))
        .filter(menu => menu.label !== '' && menu.options.length > 0);
      
      // If menu selections are configured, automatically enable hasMenuSelection for festiveMornings
      if (form.segment === 'festiveMornings' && eventData.menuSelections.length > 0) {
        eventData.hasMenuSelection = true;
      }
      
      console.log('💾 Saving menu selections:', {
        segment: form.segment,
        menuSelectionsCount: eventData.menuSelections.length,
        menuSelections: eventData.menuSelections
      });
    }

    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      
      if (res.ok) {
        alert("✅ Event updated successfully!");
        router.push("/admin/events");
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-600">Event not found</p>
          <button 
            onClick={() => router.push("/admin/events")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <button 
          onClick={() => router.push("/admin/events")}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Events
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="Enter event title" 
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
              <option value="festiveMornings">Festive Mornings</option>
              <option value="mamaFit">MamaFit</option>
              <option value="eklektikEdit">Eklektik Edit</option>
              <option value="familyDay">Family Day</option>
              <option value="coffeeMeetup">Coffee Meetup (Members Only)</option>
            </select>
          </div>
        </div>

        {/* Members Only Checkbox */}
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
            placeholder="Enter event description" 
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
                placeholder="Enter a custom message for participants (optional)" 
                rows={3}
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <input 
                name="meetingLink" 
                value={form.meetingLink} 
                onChange={handleChange} 
                placeholder="Enter meeting link (e.g., Zoom, Google Meet, etc.)" 
                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </>
        )}

        {/* Menu Selection for mamaBreakfast and festiveMornings */}
        {(form.segment === "mamaBreakfast" || form.segment === "festiveMornings") && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Menu Selections</h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure 3 menu selections for customers to choose from. Each selection can have multiple options.
            </p>
            
            {form.menuSelections.map((menuSelection, menuIndex) => (
              <div key={menuIndex} className="mb-6 p-4 bg-white rounded-md border border-gray-200">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Menu Selection {menuIndex + 1} Label
                  </label>
                  <input
                    type="text"
                    value={menuSelection.label}
                    onChange={(e) => handleMenuSelectionLabelChange(menuIndex, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`e.g., Main Course Selection, Beverage Selection, etc.`}
                  />
                </div>
                
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  {menuSelection.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleMenuOptionChange(menuIndex, optionIndex, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleMenuOptionRemove(menuIndex, optionIndex)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleMenuOptionAdd(menuIndex)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Upload Section */}
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
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current image: {form.coverImage}
              </p>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors ${
              imageFile ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop a new image here, or{" "}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    browse files
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
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
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

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="e.g., 10:00 AM, 2:30 PM, 19:00"
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="e.g., 12:00 PM, 4:30 PM, 21:00"
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>

        {/* Price, Seats, and Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (AED)</label>
            <input 
              type="number" 
              name="price" 
              value={form.price} 
              onChange={handleChange} 
              placeholder="0.00" 
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            {form.segment === 'familyDay' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-1">Family Day Pricing Tiers:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Parents + 2 children: 270 AED</li>
                  <li>• Parents + 3 children: 405 AED</li>
                  <li>• Parents + 4 children: 540 AED</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  Note: Pricing is automatically calculated based on number of children selected during booking.
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats *</label>
            <input 
              type="number" 
              name="seats" 
              value={form.seats} 
              onChange={handleChange} 
              placeholder="50" 
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
              placeholder="Enter event location" 
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>

        {/* Booking Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking Deadline
            <span className="text-gray-500 text-sm ml-1">(Optional - Book Now button will be disabled after this date)</span>
          </label>
          <input 
            type="datetime-local" 
            name="bookingDeadline" 
            value={form.bookingDeadline} 
            onChange={handleChange} 
            className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to allow booking until the event date. Set a deadline to stop bookings earlier.
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={!form.coverImage || isUploading || saving}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? "Updating Event..." : "Update Event"}
        </button>
      </form>
    </div>
  );
}



