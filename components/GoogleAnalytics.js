'use client';

import Script from 'next/script';
import { GA_TRACKING_ID } from '../lib/gtag';

export default function GoogleAnalytics() {
  // Debug logging
  console.log('GoogleAnalytics component rendering...');
  console.log('GA_TRACKING_ID:', GA_TRACKING_ID);
  
  // Don't render anything if GA_TRACKING_ID is not set
  if (!GA_TRACKING_ID) {
    console.warn('GA_TRACKING_ID is not set. Google Analytics will not load.');
    return null;
  }

  console.log('Loading Google Analytics with ID:', GA_TRACKING_ID);

  return (
    <>
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        onLoad={() => {
          console.log('Google Analytics script loaded successfully');
        }}
        onError={(e) => {
          console.error('Failed to load Google Analytics script:', e);
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            console.log('Initializing Google Analytics...');
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              debug_mode: true
            });
            console.log('Google Analytics initialized with ID: ${GA_TRACKING_ID}');
            console.log('Current page path:', window.location.pathname);
          `,
        }}
      />
    </>
  );
}
