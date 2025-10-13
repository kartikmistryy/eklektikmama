'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Membership context
const MembershipContext = createContext();

// Membership reducer
function membershipReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_MEMBERSHIP':
      return {
        ...state,
        membership: action.payload,
        isMember: !!action.payload,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_MEMBERSHIP':
      return {
        ...state,
        membership: null,
        isMember: false,
        loading: false,
        error: null
      };
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.payload
      };
    default:
      return state;
  }
}

// Initial state
const initialState = {
  membership: null,
  isMember: false,
  email: '',
  loading: false,
  error: null
};

// Membership provider component
export function MembershipProvider({ children }) {
  const [state, dispatch] = useReducer(membershipReducer, initialState);

  // Load membership from localStorage on mount
  useEffect(() => {
    const savedMembership = localStorage.getItem('membership-data');
    const savedEmail = localStorage.getItem('membership-email');
    
    if (savedMembership && savedEmail) {
      try {
        const membership = JSON.parse(savedMembership);
        dispatch({ type: 'SET_MEMBERSHIP', payload: membership });
        dispatch({ type: 'SET_EMAIL', payload: savedEmail });
      } catch (error) {
        console.error('Error loading membership from localStorage:', error);
        localStorage.removeItem('membership-data');
        localStorage.removeItem('membership-email');
      }
    }
  }, []);

  // Save membership to localStorage whenever it changes
  useEffect(() => {
    if (state.membership) {
      localStorage.setItem('membership-data', JSON.stringify(state.membership));
    } else {
      localStorage.removeItem('membership-data');
    }
  }, [state.membership]);

  useEffect(() => {
    if (state.email) {
      localStorage.setItem('membership-email', state.email);
    } else {
      localStorage.removeItem('membership-email');
    }
  }, [state.email]);

  // Verify membership by email
  const verifyMembership = async (email) => {
    if (!email) {
      dispatch({ type: 'SET_ERROR', payload: 'Email is required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_EMAIL', payload: email });

    try {
      console.log('🔄 Verifying membership for:', email);
      
      const response = await fetch('/api/membership/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📊 Membership verification response:', { status: response.status, data });

      if (response.ok) {
        if (data.isMember) {
          console.log('✅ Membership verified successfully');
          dispatch({ type: 'SET_MEMBERSHIP', payload: data.membership });
        } else {
          console.log('ℹ️ No active membership found');
          dispatch({ type: 'CLEAR_MEMBERSHIP' });
          dispatch({ type: 'SET_ERROR', payload: data.message || 'No active membership found' });
        }
      } else {
        console.log('❌ Membership verification failed:', data.error);
        dispatch({ type: 'CLEAR_MEMBERSHIP' });
        
        // Handle specific error types
        if (response.status === 503) {
          dispatch({ type: 'SET_ERROR', payload: 'Database connection issue. Please try again in a moment.' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: data.error || 'Failed to verify membership' });
        }
      }
    } catch (error) {
      console.error('❌ Network error during membership verification:', error);
      dispatch({ type: 'CLEAR_MEMBERSHIP' });
      dispatch({ type: 'SET_ERROR', payload: 'Network error. Please check your connection and try again.' });
    }
  };

  // Clear membership
  const clearMembership = () => {
    dispatch({ type: 'CLEAR_MEMBERSHIP' });
    dispatch({ type: 'SET_EMAIL', payload: '' });
  };

  // Calculate discounted price
  const getDiscountedPrice = (originalPrice, discountPercentage = 10) => {
    if (!state.isMember || !originalPrice) return originalPrice;
    
    const discountAmount = parseFloat(originalPrice) * (discountPercentage / 100);
    return (parseFloat(originalPrice) - discountAmount).toFixed(2);
  };

  // Get discount amount
  const getDiscountAmount = (originalPrice, discountPercentage = 10) => {
    if (!state.isMember || !originalPrice) return 0;
    return parseFloat(originalPrice) * (discountPercentage / 100);
  };

  const value = {
    membership: state.membership,
    isMember: state.isMember,
    email: state.email,
    loading: state.loading,
    error: state.error,
    verifyMembership,
    clearMembership,
    getDiscountedPrice,
    getDiscountAmount
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

// Custom hook to use membership context
export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership must be used within a MembershipProvider');
  }
  return context;
}
