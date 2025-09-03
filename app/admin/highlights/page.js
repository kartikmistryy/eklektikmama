"use client";
import { useState, useRef } from 'react';

export default function AdminHighlights() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photos: ['', '', '', '', '', '', '', '', '', ''] // 10 photo inputs
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadMessages, setUploadMessages] = useState({});
  const fileInputRefs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (index, value) => {
    const newPhotos = [...formData.photos];
    newPhotos[index] = value;
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = async (index, file) => {
    if (!file) {
      setUploadMessages(prev => ({ ...prev, [index]: "❌ Please select an image first" }));
      return;
    }

    setUploadingIndex(index);
    setUploadMessages(prev => ({ ...prev, [index]: "📤 Uploading to Cloudinary..." }));

    try {
      // Convert file to base64 for Cloudinary
      const base64String = await fileToBase64(file);
      
      // Upload to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const uploadData = new FormData();
      uploadData.append('file', base64String);
      uploadData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      uploadData.append('folder', 'eklektikmama/highlights');

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
      const newPhotos = [...formData.photos];
      newPhotos[index] = result.secure_url;
      setFormData(prev => ({
        ...prev,
        photos: newPhotos
      }));

      setUploadMessages(prev => ({ ...prev, [index]: "✅ Image uploaded successfully!" }));
      
      // Clear the file input after successful upload
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = "";
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadMessages(prev => ({ ...prev, [index]: "" }));
      }, 3000);

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setUploadMessages(prev => ({ ...prev, [index]: `❌ Upload failed: ${error.message}` }));
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleFileSelect = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      uploadToCloudinary(index, file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Filter out empty photo URLs
      const filteredPhotos = formData.photos.filter(photo => photo.trim() !== '');
      
      if (filteredPhotos.length < 6) {
        setMessage('❌ Please provide at least 6 photos');
        setIsSubmitting(false);
        return;
      }

      if (filteredPhotos.length > 10) {
        setMessage('❌ Maximum 10 photos allowed');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          photos: filteredPhotos
        }),
      });

      if (response.ok) {
        setMessage('✅ Highlight created successfully!');
        setFormData({
          title: '',
          description: '',
          photos: ['', '', '', '', '', '', '', '', '', '']
        });
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Highlights</h1>
        <p className="text-gray-600">Create new event highlights with photos (up to 10 images)</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> You can either upload images directly (recommended) or paste image URLs. 
            Images are automatically uploaded to Cloudinary for optimal performance.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Event Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Photos * (6-10 photos required)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-xs text-gray-600 mb-1">
                  Photo {index + 1} {index < 6 ? '*' : ''} {index >= 6 ? '(optional)' : ''}
                </label>
                
                {/* File Upload Input */}
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(index, e)}
                    ref={(el) => fileInputRefs.current[index] = el}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleFileSelect(index, { target: { files: [null] } })}
                    disabled={uploadingIndex === index}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {uploadingIndex === index ? 'Uploading...' : 'Upload'}
                  </button>
                </div>

                {/* URL Input (as fallback) */}
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => handlePhotoChange(index, e.target.value)}
                  required={index < 6}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Photo ${index + 1} URL (or upload above)`}
                />

                {/* Upload Message */}
                {uploadMessages[index] && (
                  <div className={`text-sm p-2 rounded ${
                    uploadMessages[index].includes('✅') 
                      ? 'bg-green-50 text-green-700' 
                      : uploadMessages[index].includes('❌') 
                        ? 'bg-red-50 text-red-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}>
                    {uploadMessages[index]}
                  </div>
                )}

                {/* Preview */}
                {photo && (
                  <div className="mt-2">
                    <img 
                      src={photo} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Highlight'}
          </button>
        </div>
      </form>
    </div>
  );
}
