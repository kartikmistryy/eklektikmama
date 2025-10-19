'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProducts } from '../../lib/shopify';
import { MembershipProvider } from '../../lib/hooks/useMembership';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import MembershipDiscount from '../components/MembershipDiscount';
import { BsCart3, BsFilter } from 'react-icons/bs';
import Marquee from '../components/Marquee';
import { ShopPopup } from '../components/ShopPopup';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getProducts(12);
        const productsData = result.edges.map(edge => edge.node);
        setProducts(productsData);
        setHasMore(result.pageInfo.hasNextPage);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const lastProduct = products[products.length - 1];
      const result = await getProducts(12, lastProduct.id);
      const newProducts = result.edges.map(edge => edge.node);
      setProducts(prev => [...prev, ...newProducts]);
      setHasMore(result.pageInfo.hasNextPage);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <MembershipProvider>
      <ShopPopup />
        <div className="min-h-screen bg-gradient-to-br font-quicksand from-pink-50 to-purple-50">
          {/* Hero Section with Header Image */}
          <section className="w-full flex min-h-[90vh] flex-col items-center justify-end bg-[url('/shop/headerBg.webp')] bg-cover bg-center pt-20 overflow-x-hidden">
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center"
          initial="hidden"
        >
          <h1 className="w-fit md:text-[85px] text-[45px] font-bold uppercase text-[#f6f6f6] leading-[130%] text-center font-anton">
            SHOP DROPS
          </h1>
        </motion.div>
        <Marquee />
      </section>

          <div className="py-12">

            {/* Membership Discount Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <MembershipDiscount />
            </motion.div>

          {/* Cart Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="fixed bottom-5 right-4 z-40"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-[#093166] text-white p-4 rounded-full hover:bg-[#072a4d] transition-colors duration-300 flex items-center gap-2"
            >
              <BsCart3 className="text-xl" />
              <span className="hidden sm:inline">Cart</span>
            </button>
          </motion.div>

          {/* Products Section */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-20"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#093166] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#093166] text-white px-6 py-3 rounded-lg hover:bg-[#072a4d] transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No products available</h2>
              <p className="text-gray-600">Check back soon for new arrivals!</p>
            </motion.div>
          ) : (
            <>
              {/* Products Grid - 3x3 Layout */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-3 gap-6"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="transform hover:scale-105 transition-transform duration-300"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="bg-white text-[#093166] border-2 border-[#093166] px-8 py-3 rounded-lg font-semibold hover:bg-[#093166] hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Loading...
                      </div>
                    ) : (
                      'Load More Products'
                    )}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Cart Component */}
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    </MembershipProvider>
  );
}
