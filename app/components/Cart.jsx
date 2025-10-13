'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../lib/hooks/useCart';
import { useMembership } from '../../lib/hooks/useMembership';
import { BsX, BsPlus, BsDash, BsTrash } from 'react-icons/bs';

export default function Cart({ isOpen, onClose }) {
  const { 
    cart, 
    loading, 
    error,
    updateItemQuantity, 
    removeItemFromCart, 
    getCartTotal,
    getCartLines,
    applyMemberDiscount
  } = useCart();
  const { isMember, getDiscountedPrice, getDiscountAmount } = useMembership();

  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD'
    }).format(parseFloat(price.amount));
  };

  const handleQuantityChange = async (lineId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateItemQuantity(lineId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (lineId) => {
    setIsUpdating(true);
    try {
      await removeItemFromCart(lineId);
    } catch (error) {
      console.error('Error removing item:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to remove item from cart: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const cartLines = getCartLines();
  const cartTotal = getCartTotal();
  
  // Calculate membership discount
  const calculateMembershipDiscount = () => {
    if (!isMember || !cartLines.length) return { discount: 0, total: 0 };
    
    const originalTotal = parseFloat(cartTotal.amount);
    const discount = getDiscountAmount(originalTotal);
    const discountedTotal = originalTotal - discount;
    
    return {
      discount,
      originalTotal,
      discountedTotal
    };
  };
  
  const membershipDiscount = calculateMembershipDiscount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-[#093166]">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <BsX className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {cartLines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some products to get started!</p>
                  <button
                    onClick={onClose}
                    className="bg-[#093166] text-white px-6 py-2 rounded-lg hover:bg-[#072a4d] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {cartLines.map((line) => {
                    const variant = line.merchandise;
                    const product = variant.product;
                    const image = product.images?.edges?.[0]?.node;
                    
                    return (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          {image ? (
                            <Image
                              src={image.url}
                              alt={image.altText || product.title}
                              fill
                              className="object-cover rounded"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-sm">📦</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {product.title}
                          </h4>
                          {variant.title !== 'Default Title' && (
                            <p className="text-sm text-gray-500">{variant.title}</p>
                          )}
                          <p className="text-sm font-semibold text-[#093166]">
                            {formatPrice(variant.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                              disabled={isUpdating || line.quantity <= 1}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <BsDash className="w-3 h-3" />
                            </button>
                            <span className="px-2 py-1 bg-white rounded text-sm font-medium min-w-[2rem] text-center">
                              {line.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                              disabled={isUpdating}
                              className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <BsPlus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveItem(line.id);
                            }}
                            disabled={isUpdating}
                            className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Remove item from cart"
                            type="button"
                          >
                            {isUpdating ? (
                              <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <BsTrash className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartLines.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Show applied discount codes from Shopify cart */}
                {cart?.discountCodes && cart.discountCodes.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-700 font-medium mb-2">Applied Discounts:</div>
                    {cart.discountCodes.map((discount, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Code: {discount.code}</span>
                        <span className={`font-semibold ${discount.applicable ? 'text-green-600' : 'text-red-500'}`}>
                          {discount.applicable ? '✅ Applied' : '❌ Not Applicable'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                
                {/* Show membership discount calculation */}
                {isMember && membershipDiscount.discount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 font-medium">Member Discount (10%)</span>
                      <span className="text-blue-600 font-semibold">
                        -{formatPrice({ amount: membershipDiscount.discount.toFixed(2), currencyCode: cartTotal.currencyCode })}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {isMember && membershipDiscount.discount > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span className="line-through">{formatPrice(cartTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-[#093166]">
                      {isMember && membershipDiscount.discount > 0 
                        ? formatPrice({ amount: membershipDiscount.discountedTotal.toFixed(2), currencyCode: cartTotal.currencyCode })
                        : formatPrice(cartTotal)
                      }
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={async () => {
                    // Check if member has discount applied
                    const memberDiscount = localStorage.getItem('member-discount');
                    
                    if (memberDiscount && isMember) {
                      try {
                        const discount = JSON.parse(memberDiscount);
                        const isRecent = Date.now() - discount.timestamp < 60 * 60 * 1000; // 1 hour
                        
                        if (isRecent && discount.applied) {
                          try {
                            // Use the cart hook's applyMemberDiscount function
                            const result = await applyMemberDiscount(discount.email || 'kaushikvnk@gmail.com');
                            
                            if (result.success) {
                              // Wait a moment for the cart to update
                              await new Promise(resolve => setTimeout(resolve, 1000));
                              
                              // Redirect to checkout with the updated cart
                              window.location.href = result.cart?.checkoutUrl || cart.checkoutUrl;
                              return;
                            }
                          } catch (error) {
                            console.error('Failed to apply discount to cart:', error);
                          }
                        }
                      } catch (error) {
                        console.error('Error processing member discount:', error);
                      }
                    }
                    
                    // Redirect to checkout (discount should be applied to cart)
                    window.location.href = cart.checkoutUrl;
                  }}
                  className="block w-full bg-[#093166] text-white text-center py-3 rounded-lg font-medium hover:bg-[#072a4d] transition-colors"
                >
                  Checkout
                </button>
                
                <button
                  onClick={onClose}
                  className="block w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
