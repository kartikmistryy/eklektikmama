'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProduct } from '../../../lib/shopify';
import { CartProvider, useCart } from '../../../lib/hooks/useCart';
import { MembershipProvider, useMembership } from '../../../lib/hooks/useMembership';
import MembershipDiscount from '../../components/MembershipDiscount';
import { BsArrowLeft, BsCartPlus, BsHeart, BsShare } from 'react-icons/bs';

function ProductDetailContent() {
  const params = useParams();
  const { addItemToCart } = useCart();
  const { isMember, getDiscountedPrice, getDiscountAmount } = useMembership();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProduct(params.handle);
        setProduct(result);
        if (result?.variants?.edges?.[0]?.node) {
          setSelectedVariant(result.variants.edges[0].node);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.handle) {
      fetchProduct();
    }
  }, [params.handle]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currencyCode || 'USD'
    }).format(parseFloat(price.amount));
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    
    setIsAddingToCart(true);
    try {
      await addItemToCart(selectedVariant.id, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br font-quicksand from-pink-50 to-purple-50 flex items-center justify-center" style={{ paddingTop: '10em' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#093166] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br font-quicksand from-pink-50 to-purple-50 flex items-center justify-center" style={{ paddingTop: '10em' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">{error || 'This product does not exist.'}</p>
          <Link
            href="/shop"
            className="bg-[#093166] text-white px-6 py-3 rounded-lg hover:bg-[#072a4d] transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.edges?.map(edge => edge.node) || [];
  const variants = product.variants?.edges?.map(edge => edge.node) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br font-quicksand from-pink-50 to-purple-50" style={{ paddingTop: '10em' }}>
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[#093166] hover:text-[#072a4d] transition-colors"
          >
            <BsArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].altText || product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-6xl">📦</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-[#093166] shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Vendor */}
            <div>
              <h1 className="text-4xl font-bold text-[#093166] mb-2">{product.title}</h1>
              {product.vendor && (
                <p className="text-lg text-gray-600">by {product.vendor}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              {isMember ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-gray-500 line-through">
                      {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.priceRange.minVariantPrice)}
                    </span>
                    <span className="text-3xl font-bold text-[#093166]">
                      {selectedVariant 
                        ? formatPrice({
                            amount: getDiscountedPrice(selectedVariant.price.amount),
                            currencyCode: selectedVariant.price.currencyCode
                          })
                        : formatPrice({
                            amount: getDiscountedPrice(product.priceRange.minVariantPrice.amount),
                            currencyCode: product.priceRange.minVariantPrice.currencyCode
                          })
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="font-medium">Member Price</span>
                    <span className="bg-green-100 px-2 py-1 rounded-full text-sm">
                      -10%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-[#093166]">
                  {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(product.priceRange.minVariantPrice)}
                  {selectedVariant?.compareAtPrice && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      {formatPrice(selectedVariant.compareAtPrice)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Membership Discount */}
            <MembershipDiscount />

            {/* Variants */}
            {variants.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      disabled={!variant.availableForSale}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#093166] bg-[#093166] bg-opacity-10'
                          : variant.availableForSale
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{variant.title}</span>
                        <span className="text-sm text-gray-600">
                          {formatPrice(variant.price)}
                          {!variant.availableForSale && ' - Sold Out'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-lg font-semibold text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.availableForSale || isAddingToCart}
                  className="flex-1 bg-[#093166] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#072a4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <BsCartPlus className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BsHeart className="w-5 h-5" />
                </button>
                
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BsShare className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Availability:</span>
                <span className={`font-medium ${
                  selectedVariant?.availableForSale ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedVariant?.availableForSale ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
              
              {product.productType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{product.productType}</span>
                </div>
              )}
              
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <MembershipProvider>
      <CartProvider>
        <ProductDetailContent />
      </CartProvider>
    </MembershipProvider>
  );
}
