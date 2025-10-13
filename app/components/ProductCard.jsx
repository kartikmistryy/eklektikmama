'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '../../lib/hooks/useCart';
import { useMembership } from '../../lib/hooks/useMembership';
import { BsCartPlus, BsEye } from 'react-icons/bs';

export default function ProductCard({ product }) {
  const [isLoading, setIsLoading] = useState(false);
  const { addItemToCart } = useCart();
  const { isMember, getDiscountedPrice, getDiscountAmount } = useMembership();

  // Get the first available variant
  const firstVariant = product.variants?.edges?.[0]?.node;
  const firstImage = product.images?.edges?.[0]?.node;
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD'
    }).format(parseFloat(price.amount));
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant || !firstVariant.availableForSale) {
      console.log('❌ Cannot add to cart: variant not available', { firstVariant, availableForSale: firstVariant?.availableForSale });
      return;
    }
    
    console.log('🛒 Adding product to cart:', { 
      productTitle: product.title, 
      variantId: firstVariant.id,
      variantTitle: firstVariant.title 
    });
    
    setIsLoading(true);
    try {
      const result = await addItemToCart(firstVariant.id, 1);
      console.log('✅ Product added to cart successfully:', result);
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert(`Failed to add item to cart: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white overflow-hidden group rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
    >
      <Link href={`/shop/${product.handle}`}>
        <div className="relative aspect-square overflow-hidden">
          {firstImage && firstImage.url ? (
            <Image
              src={firstImage.url}
              alt={firstImage.altText || product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🛍️</span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 pointer-events-auto">
              <button
                onClick={handleAddToCart}
                disabled={!product.availableForSale || isLoading}
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BsCartPlus className="w-4 h-4" />
              </button>
              <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <BsEye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2 flex-grow">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
            {product.title}
          </h3>
          {product.vendor && (
            <p className="text-sm text-gray-500 mt-1">{product.vendor}</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 min-h-[3rem]">
          <div className="flex items-center gap-2">
            {isMember ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.priceRange.minVariantPrice)}
                  </span>
                  <span className="text-xl font-bold text-[#093166]">
                    {formatPrice({
                      amount: getDiscountedPrice(product.priceRange.minVariantPrice.amount),
                      currencyCode: product.priceRange.minVariantPrice.currencyCode
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <span className="font-medium">Member Price</span>
                  <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">
                    -10%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-xl font-bold text-[#093166]">
                {formatPrice(product.priceRange.minVariantPrice)}
              </span>
            )}
            {product.priceRange.maxVariantPrice.amount !== product.priceRange.minVariantPrice.amount && (
              <span className="text-sm text-gray-500">
                - {formatPrice(product.priceRange.maxVariantPrice)}
              </span>
            )}
          </div>
          
          {!product.availableForSale && (
            <span className="text-sm text-red-500 font-medium">Sold Out</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.availableForSale || isLoading}
          className="w-full bg-[#093166] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#072a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-auto"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <BsCartPlus className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
