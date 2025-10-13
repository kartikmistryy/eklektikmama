'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { createCart, addToCart, updateCart, removeFromCart, applyDiscountCode, updateCartAttributes } from '../shopify';

// Cart context
const CartContext = createContext();

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: null,
        loading: false,
        error: null
      };
    default:
      return state;
  }
}

// Initial state
const initialState = {
  cart: null,
  loading: false,
  error: null
};

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('shopify-cart');
    console.log('🔄 Loading cart from localStorage:', { hasSavedCart: !!savedCart });
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        console.log('✅ Cart loaded from localStorage:', { cartId: cart.id, totalQuantity: cart.totalQuantity });
        dispatch({ type: 'SET_CART', payload: cart });
      } catch (error) {
        console.error('❌ Error loading cart from localStorage:', error);
        localStorage.removeItem('shopify-cart');
      }
    } else {
      console.log('ℹ️ No saved cart found in localStorage');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart) {
      console.log('💾 Saving cart to localStorage:', { cartId: state.cart.id, totalQuantity: state.cart.totalQuantity });
      localStorage.setItem('shopify-cart', JSON.stringify(state.cart));
    }
  }, [state.cart]);

  // Clear cart from localStorage when tab closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🧹 Clearing cart from localStorage on tab close');
      localStorage.removeItem('shopify-cart');
      localStorage.removeItem('member-discount');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Create new cart
  const createNewCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await createCart();
      if (result.userErrors.length > 0) {
        throw new Error(result.userErrors[0].message);
      }
      dispatch({ type: 'SET_CART', payload: result.cart });
      return result.cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Add item to cart
  const addItemToCart = async (variantId, quantity = 1) => {
    console.log('🛒 Adding item to cart:', { variantId, quantity, currentCartId: state.cart?.id });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let cart = state.cart;
      
      // Create cart if it doesn't exist
      if (!cart) {
        console.log('🆕 Creating new cart...');
        cart = await createNewCart();
      }

      console.log('➕ Adding item to existing cart:', cart.id);
      const result = await addToCart(cart.id, [{
        merchandiseId: variantId,
        quantity
      }]);

      if (result.userErrors.length > 0) {
        console.error('❌ User errors when adding item:', result.userErrors);
        throw new Error(result.userErrors[0].message);
      }

      console.log('✅ Item added successfully, updating cart state:', { 
        newCartId: result.cart.id, 
        totalQuantity: result.cart.totalQuantity 
      });
      dispatch({ type: 'SET_CART', payload: result.cart });
      return result.cart;
    } catch (error) {
      console.error('❌ Error in addItemToCart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Apply member discount code to cart
  const applyMemberDiscount = async (email) => {
    try {
      console.log('🔄 applyMemberDiscount called for:', email);
      console.log('📊 Current cart state:', { cart: state.cart, hasCart: !!state.cart });
      
      const response = await fetch('/api/membership/discount-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📊 Discount code response:', data);
      
      if (data.error) {
        console.error('❌ Discount code API error:', data.error);
        console.error('❌ Error details:', data.details);
        console.error('❌ Error type:', data.type);
        return { success: false, message: data.error, details: data.details };
      }
      
      if (data.hasDiscount) {
        console.log('🔄 Applying discount code to cart:', data.discountCode);
        
        // Store discount info in localStorage first (regardless of cart state)
        localStorage.setItem('member-discount', JSON.stringify({
          code: data.discountCode,
          email: email,
          applied: true,
          timestamp: Date.now()
        }));
        
        console.log('✅ Discount stored in localStorage');
        
        // If cart exists, apply discount to cart
        if (state.cart) {
          try {
            const result = await applyDiscountCode(state.cart.id, data.discountCode);
            
            if (result.userErrors && result.userErrors.length > 0) {
              console.error('❌ Discount application errors:', result.userErrors);
              throw new Error(result.userErrors[0].message);
            }
            
            console.log('✅ Discount applied to cart successfully');
            console.log('📊 Updated cart with discount:', result.cart);
            
            // Update cart state with the new cart that includes the discount
            dispatch({ type: 'SET_CART', payload: result.cart });
            
            // Also update cart attributes to ensure discount persists
            try {
              await updateCartAttributes(result.cart.id, [
                { key: 'member_discount_code', value: data.discountCode },
                { key: 'member_email', value: email },
                { key: 'discount_applied', value: 'true' }
              ]);
              console.log('✅ Cart attributes updated with discount info');
            } catch (attrError) {
              console.warn('⚠️ Could not update cart attributes:', attrError);
            }
            
            return { success: true, discountCode: data.discountCode, cart: result.cart };
          } catch (error) {
            console.error('❌ Failed to apply discount to cart:', error);
            // Still return success since discount is stored in localStorage
            return { success: true, discountCode: data.discountCode, cart: state.cart };
          }
        } else {
          console.log('ℹ️ No cart exists yet, discount will be applied when cart is created');
          return { success: true, discountCode: data.discountCode, cart: null };
        }
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      console.error('❌ Error applying member discount:', error);
      return { success: false, message: 'Failed to apply discount' };
    }
  };

  // Update item quantity in cart
  const updateItemQuantity = async (lineId, quantity) => {
    if (!state.cart) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await updateCart(state.cart.id, [{
        id: lineId,
        quantity
      }]);

      if (result.userErrors.length > 0) {
        throw new Error(result.userErrors[0].message);
      }

      dispatch({ type: 'SET_CART', payload: result.cart });
      return result.cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Remove item from cart
  const removeItemFromCart = async (lineId) => {
    if (!state.cart) {
      console.error('❌ No cart found when trying to remove item');
      throw new Error('No cart found. Please refresh the page and try again.');
    }

    // Check if Shopify environment variables are configured
    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || !process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.error('❌ Shopify environment variables are missing');
      throw new Error('Shop configuration is incomplete. Please contact support.');
    }

    console.log('🔄 Removing item from cart:', { cartId: state.cart.id, lineId });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await removeFromCart(state.cart.id, [lineId]);

      if (result.userErrors.length > 0) {
        console.error('❌ User errors when removing item:', result.userErrors);
        throw new Error(result.userErrors[0].message);
      }

      console.log('✅ Item removed successfully, updating cart state');
      dispatch({ type: 'SET_CART', payload: result.cart });
      return result.cart;
    } catch (error) {
      console.error('❌ Error in removeItemFromCart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('shopify-cart');
  };

  // Get cart item count
  const getItemCount = () => {
    return state.cart?.totalQuantity || 0;
  };

  // Get cart total
  const getCartTotal = () => {
    return state.cart?.cost?.totalAmount || { amount: '0', currencyCode: 'USD' };
  };

  // Get cart lines
  const getCartLines = () => {
    return state.cart?.lines?.edges?.map(edge => edge.node) || [];
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    createNewCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart,
    getItemCount,
    getCartTotal,
    getCartLines,
    applyMemberDiscount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
