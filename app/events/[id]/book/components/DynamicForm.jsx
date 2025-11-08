'use client';

import { useState, useEffect } from 'react';

const DynamicForm = ({ formConfig, onSubmit, submitting, event, onFormDataChange, isBookingDeadlinePassed, isEventPast, isMember, membershipChecked }) => {
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
      } else if (field.type === 'checkbox') {
        initialData[field.name] = false;
      } else {
        initialData[field.name] = '';
      }
    });
    // Initialize photography consent and newsletter signup as false
    initialData.photographyConsent = false;
    initialData.newsletterSignup = false;
    setFormData(initialData);
  }, [formConfig]);

  // Sync extra guest arrays when ticket count changes (always, not just when Friends & Family discount is applied)
  useEffect(() => {
    const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
    const extraGuests = Math.max(0, numberOfTickets - 1); // Always numberOfTickets - 1 (1 is for customer)
    
    const currentNames = formData.extraGuestNames || [];
    const currentEmails = formData.extraGuestEmails || [];
    const currentMainCourses = formData.extraGuestMainCourses || [];
    
    // Check if arrays need to be resized
    if (currentNames.length !== extraGuests || 
        currentEmails.length !== extraGuests ||
        currentMainCourses.length !== extraGuests) {
      const updatedFormData = {
        ...formData,
        extraGuestNames: extraGuests > 0 
          ? [...currentNames.slice(0, extraGuests), ...Array(Math.max(0, extraGuests - currentNames.length)).fill('')]
          : [],
        extraGuestEmails: extraGuests > 0
          ? [...currentEmails.slice(0, extraGuests), ...Array(Math.max(0, extraGuests - currentEmails.length)).fill('')]
          : [],
        extraGuestMainCourses: extraGuests > 0
          ? [...currentMainCourses.slice(0, extraGuests), ...Array(Math.max(0, extraGuests - currentMainCourses.length)).fill('')]
          : []
      };
      setFormData(updatedFormData);
      if (onFormDataChange) {
        onFormDataChange(updatedFormData);
      }
    }
  }, [formData.numberOfTickets, event?.segment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newFormData;
    
    if (type === 'checkbox') {
      // Special handling for consent checkboxes and Friends & Family discount
      if (name === 'photographyConsent' || name === 'waiverConsent' || name === 'applyFriendsFamilyDiscount' || name === 'familyDiscountTerms' || name === 'newsletterSignup') {
        newFormData = {
          ...formData,
          [name]: checked
        };
        
        // If unchecking Friends & Family discount, clear extra guest data
        if (name === 'applyFriendsFamilyDiscount' && !checked) {
          newFormData.extraGuestNames = [];
          newFormData.extraGuestEmails = [];
          newFormData.extraGuestMainCourses = [];
          newFormData.familyMemberNames = [];
          newFormData.familyMemberContacts = [];
          newFormData.familyDiscountTerms = false;
        }
        
        // If checking Friends & Family discount, set ticket count to 2 (1 for customer + 1 extra guest)
        if (name === 'applyFriendsFamilyDiscount' && checked) {
          // Always set to 2 when discount is checked (1 for customer + 1 extra guest)
          newFormData.numberOfTickets = '2';
          const extraGuests = 1; // 2 tickets - 1 for customer = 1 extra guest
          newFormData.extraGuestNames = Array(extraGuests).fill('');
          newFormData.extraGuestEmails = Array(extraGuests).fill('');
          newFormData.extraGuestMainCourses = Array(extraGuests).fill(''); // Always initialize menu selections for all events
        }
        
        setFormData(newFormData);
      } else {
        // Regular checkbox handling for multi-select checkboxes
        const currentValues = formData[name] || [];
        if (checked) {
          newFormData = {
            ...formData,
            [name]: [...currentValues, value]
          };
        } else {
          newFormData = {
            ...formData,
            [name]: currentValues.filter(v => v !== value)
          };
        }
        setFormData(newFormData);
      }
    } else if (type === 'radio') {
      newFormData = {
        ...formData,
        [name]: value
      };
      setFormData(newFormData);
    } else {
      newFormData = {
        ...formData,
        [name]: value
      };
      setFormData(newFormData);
    }
    
    // Call onFormDataChange if provided
    if (onFormDataChange && newFormData) {
      onFormDataChange(newFormData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!waiverAccepted) {
      alert('Please accept the waiver to continue.');
      return;
    }
    
    // Validate main course selection for mamaBreakfast events
    if (event?.segment === 'mamaBreakfast') {
      const mainCourseSelection = formData.choiceI;
      if (!mainCourseSelection || mainCourseSelection.trim() === '') {
        alert('Please select a main course option. You cannot proceed without selecting a main course.');
        return;
      }
    }
    
    // Validate extra guest information (always validate when there are extra guests, regardless of discount)
    const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
    const extraGuests = Math.max(0, numberOfTickets - 1);
    
    if (extraGuests > 0) {
      // Validate extra guest information
        // Validate extra guest names
        if (!formData.extraGuestNames || !Array.isArray(formData.extraGuestNames)) {
          alert('Please enter names for all extra guests.');
          return;
        }
        
        const filledNames = formData.extraGuestNames.filter(name => name && name.trim());
        if (filledNames.length !== extraGuests) {
          alert(`Please enter names for all ${extraGuests} extra guest(s). You entered ${filledNames.length} name(s).`);
          return;
        }
        
        // Validate extra guest emails
        if (!formData.extraGuestEmails || !Array.isArray(formData.extraGuestEmails)) {
          alert('Please enter email addresses for all extra guests.');
          return;
        }
        
        const filledEmails = formData.extraGuestEmails.filter(email => email && email.trim());
        if (filledEmails.length !== extraGuests) {
          alert(`Please enter email addresses for all ${extraGuests} extra guest(s). You entered ${filledEmails.length} email(s).`);
          return;
        }
        
        // Validate email format
        for (let i = 0; i < filledEmails.length; i++) {
          const email = filledEmails[i];
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            alert(`Please enter a valid email address for guest ${i + 1}.`);
            return;
          }
        }
        
        // Validate main course selection for all extra guests (all events)
        if (!formData.extraGuestMainCourses || !Array.isArray(formData.extraGuestMainCourses)) {
          alert('Please select main course for all extra guests.');
          return;
        }
        
        const filledMainCourses = formData.extraGuestMainCourses.filter(course => course && course.trim());
        if (filledMainCourses.length !== extraGuests) {
          alert(`Please select main course for all ${extraGuests} extra guest(s).`);
          return;
        }
    }
    
    // Validate Friends & Family discount terms if discount is applied
    if (formData.applyFriendsFamilyDiscount && !formData.familyDiscountTerms) {
      alert('Please acknowledge the Friends & Family discount terms.');
      return;
    }
    
    onSubmit(formData);
  };

  const renderField = (field) => {
    const { name, label, type, required, options } = field;
    const value = formData[name] || '';

    // Handle conditional Friends & Family fields
    // Always hide old familyMemberNames/familyMemberContacts fields (we use new Extra Guest section instead)
    if (name === 'familyMemberNames' || name === 'familyMemberContacts') {
      // Always hide these old fields - we use the new Extra Guest Information section instead
      return null;
    }
    if (name === 'familyDiscountTerms') {
      if (!formData.applyFriendsFamilyDiscount) {
        return null; // Don't render discount terms if discount is not applied
      }
    }

    // Make Friends & Family fields required when discount is applied
    const isConditionallyRequired = (name === 'familyMemberNames' || name === 'familyDiscountTerms') && formData.applyFriendsFamilyDiscount;
    const isFieldRequired = required || isConditionallyRequired;

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
      case 'number':
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {isFieldRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={isFieldRequired}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {isFieldRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={isFieldRequired}
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
              {label} {isFieldRequired && <span className="text-red-500">*</span>}
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
              {label} {isFieldRequired && <span className="text-red-500">*</span>}
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
                    required={isFieldRequired}
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
              {label} {isFieldRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              id={name}
              name={name}
              value={value}
              onChange={handleInputChange}
              required={isFieldRequired}
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
                required={isFieldRequired}
                className="mt-1 mr-3 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{label} {isFieldRequired && <span className="text-red-500">*</span>}</span>
                {field.text && (
                  <p className="text-xs text-gray-600 mt-1">{field.text}</p>
                )}
              </div>
            </label>
          </div>
        );

      case 'dynamicInputs':
        const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
        // For familyMemberNames/Contacts: if discount is not checked, use numberOfTickets - 1 (1 is for customer)
        // Otherwise, use numberOfTickets (old behavior for backward compatibility)
        const inputCount = (name === 'familyMemberNames' || name === 'familyMemberContacts') && !formData.applyFriendsFamilyDiscount
          ? Math.max(0, numberOfTickets - 1) // Extra guests only (exclude customer)
          : numberOfTickets; // Old behavior for other fields
        const inputs = [];
        
        for (let i = 0; i < inputCount; i++) {
          const inputName = `${name}[${i}]`;
          const inputValue = formData[name] && formData[name][i] ? formData[name][i] : '';
          
          inputs.push(
            <div key={i} className="mb-3">
              <label htmlFor={inputName} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {i + 1} {isFieldRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id={inputName}
                name={inputName}
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  const currentArray = formData[name] || [];
                  const newArray = [...currentArray];
                  newArray[i] = newValue;
                  
                  const newFormData = {
                    ...formData,
                    [name]: newArray
                  };
                  
                  setFormData(newFormData);
                  if (onFormDataChange) {
                    onFormDataChange(newFormData);
                  }
                }}
                required={isFieldRequired}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                placeholder={`Enter ${label.toLowerCase()} ${i + 1}`}
              />
            </div>
          );
        }
        
        return (
          <div key={name}>
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700">{label} {isFieldRequired && <span className="text-red-500">*</span>}</span>
              {field.text && (
                <p className="text-xs text-gray-600 mt-1">{field.text}</p>
              )}
            </div>
            {inputs}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Status Messages */}
      {isBookingDeadlinePassed && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Booking Closed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The booking deadline for this event has passed. Bookings are no longer available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isEventPast && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Event Passed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This event has already taken place. Bookings are no longer available.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onChange={(e) => {
            const newValue = e.target.value;
            const newFormData = {
              ...formData,
              numberOfTickets: newValue
            };
            
            // Update extra guest data when ticket count changes (always, not just when Friends & Family discount is applied)
            const numberOfTickets = parseInt(newValue) || 1;
            const extraGuests = Math.max(0, numberOfTickets - 1);
            // Preserve existing data, but resize arrays
            const currentNames = formData.extraGuestNames || [];
            const currentEmails = formData.extraGuestEmails || [];
            const currentMainCourses = formData.extraGuestMainCourses || [];
            
            newFormData.extraGuestNames = [
              ...currentNames.slice(0, extraGuests),
              ...Array(Math.max(0, extraGuests - currentNames.length)).fill('')
            ];
            newFormData.extraGuestEmails = [
              ...currentEmails.slice(0, extraGuests),
              ...Array(Math.max(0, extraGuests - currentEmails.length)).fill('')
            ];
            newFormData.extraGuestMainCourses = [
              ...currentMainCourses.slice(0, extraGuests),
              ...Array(Math.max(0, extraGuests - currentMainCourses.length)).fill('')
            ];
            
            setFormData(newFormData);
            if (onFormDataChange) {
              onFormDataChange(newFormData);
            }
          }}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num} {num === 1 ? 'ticket' : 'tickets'}</option>
          ))}
        </select>
      </div>

      {/* Extra Guest Information (shown when there are extra guests, regardless of Friends & Family discount) */}
      {(() => {
        const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
        // Calculate extra guests: numberOfTickets - 1 (because 1 ticket is for the customer)
        // Example: 2 tickets = 1 customer + 1 extra guest = 1 input
        //          3 tickets = 1 customer + 2 extra guests = 2 inputs
        //          4 tickets = 1 customer + 3 extra guests = 3 inputs
        const extraGuests = Math.max(0, numberOfTickets - 1);
        
        console.log('🎫 Extra Guest Calculation:', {
          numberOfTickets,
          extraGuests,
          calculation: `${numberOfTickets} tickets - 1 customer = ${extraGuests} extra guest(s)`
        });
        
        if (extraGuests === 0) return null;
        
        // Get current arrays (they should already be the correct size from useEffect)
        const extraGuestNames = formData.extraGuestNames || Array(extraGuests).fill('');
        const extraGuestEmails = formData.extraGuestEmails || Array(extraGuests).fill('');
        const extraGuestMainCourses = formData.extraGuestMainCourses || Array(extraGuests).fill('');
        
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-[#093166] mb-2">
              Extra Guest Information ({extraGuests} {extraGuests === 1 ? 'guest' : 'guests'})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide details for each extra guest. You will receive 1 ticket for yourself + {extraGuests} {extraGuests === 1 ? 'ticket' : 'tickets'} for {extraGuests === 1 ? 'your guest' : 'your guests'}.
            </p>
            
            {Array.from({ length: extraGuests }, (_, index) => (
              <div key={index} className="bg-white p-4 rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Guest {index + 1}</h4>
                
                <div className="space-y-3">
                  {/* Guest Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest {index + 1} Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={extraGuestNames[index] || ''}
                      onChange={(e) => {
                        const newNames = [...extraGuestNames];
                        newNames[index] = e.target.value;
                        const newFormData = {
                          ...formData,
                          extraGuestNames: newNames
                        };
                        setFormData(newFormData);
                        if (onFormDataChange) {
                          onFormDataChange(newFormData);
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                      placeholder={`Enter guest ${index + 1} name`}
                    />
                  </div>
                  
                  {/* Guest Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest {index + 1} Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={extraGuestEmails[index] || ''}
                      onChange={(e) => {
                        const newEmails = [...extraGuestEmails];
                        newEmails[index] = e.target.value;
                        const newFormData = {
                          ...formData,
                          extraGuestEmails: newEmails
                        };
                        setFormData(newFormData);
                        if (onFormDataChange) {
                          onFormDataChange(newFormData);
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                      placeholder={`Enter guest ${index + 1} email`}
                    />
                  </div>
                  
                  {/* Main Course Selection (for all events) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest {index + 1} Main Course Selection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={extraGuestMainCourses[index] || ''}
                      onChange={(e) => {
                        const newMainCourses = [...extraGuestMainCourses];
                        newMainCourses[index] = e.target.value;
                        const newFormData = {
                          ...formData,
                          extraGuestMainCourses: newMainCourses
                        };
                        setFormData(newFormData);
                        if (onFormDataChange) {
                          onFormDataChange(newFormData);
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#093166] focus:border-transparent"
                    >
                      <option value="">Select main course</option>
                      <option value="Egg & Truffle Toast">Egg & Truffle Toast</option>
                      <option value="Sour Dough Tuna">Sour Dough Tuna</option>
                      <option value="French Toast with Ice cream">French Toast with Ice cream</option>
                      <option value="Avocado Croissant">Avocado Croissant</option>
                      <option value="Omlette Turkey Ham and Cheese">Omlette Turkey Ham and Cheese</option>
                      <option value="Peach and Almond Salad">Peach and Almond Salad</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Total Price Display */}
      {event?.price > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Amount:</span>
            <span className="text-xl font-bold text-[#093166]">
              AED {(() => {
                const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
                // Total adult guests = number of tickets (1 for user + extra guests)
                const totalAdultGuests = numberOfTickets;
                
                const basePrice = event.price * totalAdultGuests;
                
                // Apply member discount first (10% if member)
                const memberDiscount = isMember ? 0.1 : 0;
                let discountedPrice = basePrice * (1 - memberDiscount);
                
                // Then apply Friends & Family discount (10% additional)
                const friendsFamilyDiscount = formData.applyFriendsFamilyDiscount ? 0.1 : 0;
                discountedPrice = discountedPrice * (1 - friendsFamilyDiscount);
                
                return discountedPrice.toFixed(2);
              })()}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {(() => {
              const numberOfTickets = parseInt(formData.numberOfTickets) || 1;
              const totalAdultGuests = numberOfTickets;
              const displayText = `${totalAdultGuests} ${totalAdultGuests === 1 ? 'ticket' : 'tickets'} = ${totalAdultGuests} ${totalAdultGuests === 1 ? 'adult guest' : 'adult guests'}`;
              
              return (
                <>
                  <span className="font-medium">Total Adult Guests:</span> {displayText}
          {formData.applyFriendsFamilyDiscount && (
                    <span className="ml-2 text-green-600 font-medium">(Friends & Family Discount Applied: 10% off)</span>
                  )}
                </>
              );
            })()}
            </div>
        </div>
      )}

      {/* Membership Discount Message */}
      {event?.price > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
          {isMember ? (
            <p className="text-sm text-pink-800 font-medium">
              Your exclusive 10% Eklektik Mama member discount will be applied at the Stripe checkout. Thank you for being part of EKLEKTIK AF! 💖
            </p>
          ) : (
            <p className="text-sm text-purple-800 font-medium">
              Did you know? Eklektik Mama members get an instant 10% discount on every order. Join today to save! <a href="/eklektikmamaMembership" className="text-purple-600 underline hover:text-purple-800">Join EKLEKTIK AF</a>
            </p>
          )}
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

      {/* Newsletter Signup */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="newsletterSignup"
            checked={formData.newsletterSignup || false}
            onChange={handleInputChange}
            className="mr-3 text-[#093166] focus:ring-[#093166] border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            Stay informed with our latest news and events
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
        disabled={submitting || !waiverAccepted || isBookingDeadlinePassed || isEventPast}
        className="w-full bg-[#093166] text-white py-3 px-6 rounded-md font-medium hover:bg-[#093166]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Processing...' : 
         isBookingDeadlinePassed ? 'Booking Closed' :
         isEventPast ? 'Event Passed' :
         'Proceed to Payment'}
      </button>
    </form>
  );
};

export default DynamicForm;
