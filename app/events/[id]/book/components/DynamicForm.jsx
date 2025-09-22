'use client';

import { useState, useEffect } from 'react';

const DynamicForm = ({ formConfig, onSubmit, submitting, event }) => {
  const [formData, setFormData] = useState({});
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  // Initialize form data with empty values
  useEffect(() => {
    const initialData = {};
    formConfig.fields.forEach(field => {
      if (field.type === 'checkboxGroup') {
        initialData[field.name] = [];
      } else if (field.type === 'radio') {
        initialData[field.name] = '';
      } else {
        initialData[field.name] = '';
      }
    });
    // Initialize photography consent as false
    initialData.photographyConsent = false;
    setFormData(initialData);
  }, [formConfig]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Special handling for consent checkboxes
      if (name === 'photographyConsent' || name === 'waiverConsent') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // Regular checkbox handling for multi-select checkboxes
        const currentValues = formData[name] || [];
        if (checked) {
          setFormData(prev => ({
            ...prev,
            [name]: [...currentValues, value]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: currentValues.filter(v => v !== value)
          }));
        }
      }
    } else if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!waiverAccepted) {
      alert('Please accept the waiver to continue.');
      return;
    }
    
    onSubmit(formData);
  };

  const renderField = (field) => {
    const { name, label, type, required, options } = field;
    const value = formData[name] || '';

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
      case 'number':
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={required}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );

      case 'checkboxGroup':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    name={name}
                    value={option}
                    checked={formData[name]?.includes(option) || false}
                    onChange={handleInputChange}
                    className="mr-2 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={name}
                    value={option}
                    checked={formData[name] === option}
                    onChange={handleInputChange}
                    required={required}
                    className="mr-2 text-[#093166] focus:ring-[#093166] border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'info':
        return (
          <div key={name} className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <label className="block text-sm font-medium text-blue-800 mb-1">
              {label}
            </label>
            <p className="text-sm text-blue-700">{field.text}</p>
          </div>
        );

      case 'checkbox':
        return (
          <div key={name} className="space-y-2">
            <label className="flex items-start">
              <input
                type="checkbox"
                name={name}
                checked={formData[name] || false}
                onChange={handleInputChange}
                required={required}
                className="mt-1 mr-3 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{label} {required && <span className="text-red-500">*</span>}</span>
                {field.text && (
                  <p className="text-xs text-gray-600 mt-1">{field.text}</p>
                )}
              </div>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Fields */}
      <div className="space-y-4">
        {formConfig.fields.map(renderField)}
      </div>

      {/* Ticket Quantity */}
      <div>
        <label htmlFor="numberOfTickets" className="block text-sm font-medium text-gray-700 mb-1">
          Number of Tickets <span className="text-red-500">*</span>
        </label>
        <select
          id="numberOfTickets"
          name="numberOfTickets"
          value={formData.numberOfTickets || 1}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'ticket' : 'tickets'}</option>
          ))}
        </select>
      </div>

      {/* Total Price Display */}
      {event?.price > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span className="text-xl font-bold text-[#093166]">
              AED {((event.price * (formData.numberOfTickets || 1)).toFixed(2))}
            </span>
          </div>
        </div>
      )}

      {/* Photography Consent */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="photographyConsent"
            checked={formData.photographyConsent || false}
            onChange={handleInputChange}
            className="mr-3 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            Consent to photography - I consent to being photographed during the event for promotional purposes
          </span>
        </label>
      </div>

      {/* Waiver */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Event Waiver</h3>
        <div className="max-h-40 overflow-y-auto text-sm text-gray-600 mb-4">
          <pre className="whitespace-pre-wrap font-sans">{formConfig.waiver}</pre>
        </div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            className="mr-2 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
            required
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the terms and conditions above <span className="text-red-500">*</span>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !waiverAccepted}
        className="w-full bg-[#093166] text-white py-3 px-6 rounded-md font-medium hover:bg-[#093166]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </form>
  );
};

export default DynamicForm;
