'use client';

import { useEffect } from 'react';
import { useCart } from '../../lib/hooks/useCart';

export default function CheckoutRedirect() {
  const { cart } = useCart();

  useEffect(() => {
    if (cart?.checkoutUrl) {
      // Check if there's a member discount applied
      const memberDiscount = localStorage.getItem('member-discount');
      
      if (memberDiscount) {
        try {
          const discount = JSON.parse(memberDiscount);
          
          // If discount was applied recently (within last hour)
          const isRecent = Date.now() - discount.timestamp < 60 * 60 * 1000;
          
          if (isRecent && discount.applied) {
            console.log('🎯 Member discount detected, redirecting to checkout with discount');
            
            // Add discount code to checkout URL if not already present
            let checkoutUrl = cart.checkoutUrl;
            if (!checkoutUrl.includes('discount=') && !checkoutUrl.includes('code=')) {
              const separator = checkoutUrl.includes('?') ? '&' : '?';
              checkoutUrl = `${checkoutUrl}${separator}discount=${discount.code}`;
            }
            
            // Redirect to checkout with discount
            window.location.href = checkoutUrl;
            return;
          }
        } catch (error) {
          console.error('Error parsing member discount:', error);
        }
      }
      
      // Regular checkout redirect
      console.log('🛒 Redirecting to checkout');
      window.location.href = cart.checkoutUrl;
    }
  }, [cart]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#093166] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}

