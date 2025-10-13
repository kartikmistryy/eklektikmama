'use client';

import React, { useState } from 'react';
import { useMembership } from '../../lib/hooks/useMembership';
import { useCart } from '../../lib/hooks/useCart';
import { BsCheckCircle, BsXCircle, BsGift } from 'react-icons/bs';

export default function MembershipDiscount() {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  
  // Check if discount is already applied on component mount
  React.useEffect(() => {
    const memberDiscount = localStorage.getItem('member-discount');
    if (memberDiscount) {
      try {
        const discount = JSON.parse(memberDiscount);
        const isRecent = Date.now() - discount.timestamp < 60 * 60 * 1000; // 1 hour
        if (isRecent && discount.applied) {
          setDiscountApplied(true);
          console.log('✅ Found existing member discount in localStorage:', discount);
        }
      } catch (error) {
        console.error('❌ Error parsing member discount from localStorage:', error);
      }
    }
  }, []);
  const { 
    isMember, 
    membership, 
    loading, 
    error, 
    verifyMembership, 
    clearMembership 
  } = useMembership();
  const { applyMemberDiscount } = useCart();

  const handleVerifyMembership = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    console.log('🔄 Starting membership verification for:', email);
    setIsVerifying(true);
    
    try {
      const verificationResult = await verifyMembership(email);
      console.log('✅ Membership verification completed, result:', verificationResult);
      
      // Wait a moment for the state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if user is now a member (use the verification result directly)
      const isNowMember = verificationResult?.isMember || isMember;
      console.log('🔍 Checking membership status:', { isNowMember, isMember, verificationResult });
      
      // Always try to apply discount if verification was successful
      if (isNowMember) {
        console.log('🎯 Membership verified, applying discount...');
        const result = await applyMemberDiscount(email);
        console.log('📊 Discount application result:', result);
        
        if (result.success) {
          setDiscountApplied(true);
          console.log('✅ Discount applied successfully');
          
          // Verify the discount was stored in localStorage
          const storedDiscount = localStorage.getItem('member-discount');
          console.log('🔍 Stored discount in localStorage:', storedDiscount);
        } else {
          console.error('❌ Failed to apply discount:', result.message);
        }
      } else {
        console.log('❌ User is not a member after verification');
        
        // Fallback: Try to apply discount anyway if verification was successful
        console.log('🔄 Fallback: Trying to apply discount anyway...');
        try {
          const result = await applyMemberDiscount(email);
          console.log('📊 Fallback discount application result:', result);
          
          if (result.success) {
            setDiscountApplied(true);
            console.log('✅ Fallback discount applied successfully');
            
            const storedDiscount = localStorage.getItem('member-discount');
            console.log('🔍 Fallback stored discount in localStorage:', storedDiscount);
          }
        } catch (fallbackError) {
          console.error('❌ Fallback discount application failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('❌ Error during membership verification:', error);
    }
    
    setIsVerifying(false);
  };

  const handleClearMembership = () => {
    clearMembership();
    setEmail('');
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <BsGift className="w-5 h-5 text-pink-600" />
        <h3 className="font-semibold text-gray-900">Member Discount</h3>
      </div>
      
      {!isMember ? (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Enter your email to verify membership and get 10% off your order!
          </p>
          
          <form onSubmit={handleVerifyMembership} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={isVerifying || loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying || loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </form>
          
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <BsXCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <BsCheckCircle className="w-5 h-5" />
            <span className="font-medium">Membership Verified!</span>
          </div>
          
          {membership && (
            <div className="text-sm text-gray-600">
              <p>Welcome back, {membership.firstName}!</p>
              <p>You're getting 10% off all products.</p>
              {discountApplied && (
                <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-700">
                  ✅ Member discount code applied to your cart!
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleClearMembership}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Use different email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
