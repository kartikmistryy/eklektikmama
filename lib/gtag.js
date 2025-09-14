// Google Analytics configuration and utilities

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom event tracking functions for common actions
export const trackEvent = {
  // Track page views
  pageView: (url) => pageview(url),
  
  // Track button clicks
  buttonClick: (buttonName, location) => {
    event({
      action: 'click',
      category: 'button',
      label: `${buttonName} - ${location}`,
    });
  },
  
  // Track form submissions
  formSubmit: (formName) => {
    event({
      action: 'submit',
      category: 'form',
      label: formName,
    });
  },
  
  // Track external link clicks
  externalLink: (url) => {
    event({
      action: 'click',
      category: 'external_link',
      label: url,
    });
  },
  
  // Track file downloads
  fileDownload: (fileName) => {
    event({
      action: 'download',
      category: 'file',
      label: fileName,
    });
  },
  
  // Track newsletter signups
  newsletterSignup: (source) => {
    event({
      action: 'signup',
      category: 'newsletter',
      label: source,
    });
  },
  
  // Track event bookings
  eventBooking: (eventName) => {
    event({
      action: 'book',
      category: 'event',
      label: eventName,
    });
  },
  
  // Track membership purchases
  membershipPurchase: (membershipType) => {
    event({
      action: 'purchase',
      category: 'membership',
      label: membershipType,
      value: 1,
    });
  },
};
