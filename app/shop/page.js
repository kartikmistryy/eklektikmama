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
import CartCount from '../components/CartCount';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const result = await getProducts(12);
        const productsData = result.edges.map(edge => edge.node);
        
        // Console log the product data
        console.log('=== PRODUCT DATA ===');
        console.log('Total products fetched:', productsData.length);
        console.log('Raw products data:', productsData);
        
        // Log each product's details
        productsData.forEach((product, index) => {
          console.log(`\n--- Product ${index + 1} ---`);
          console.log('Title:', product.title);
          console.log('Product Type:', product.productType);
          console.log('Tags:', product.tags);
          console.log('Vendor:', product.vendor);
          console.log('Available for Sale:', product.availableForSale);
          console.log('Price Range:', product.priceRange);
          console.log('Images Count:', product.images?.edges?.length || 0);
          console.log('Variants Count:', product.variants?.edges?.length || 0);
        });
        
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

  // Categorize products
  const categorizeProducts = (products) => {
    const categories = {
      'Apparel': [],
      'Accessories': [],
      'Home & Living': [],
      'Gifts': [],
      'Other': []
    };

    products.forEach(product => {
      const productType = product.productType?.toLowerCase() || '';
      const tags = product.tags?.map(tag => tag.toLowerCase()) || [];
      
      // Categorize based on productType and tags
      if (productType.includes('shirt') || productType.includes('t-shirt') || 
          productType.includes('hoodie') || productType.includes('sweatshirt') ||
          productType.includes('top') || productType.includes('dress') ||
          tags.some(tag => tag.includes('shirt') || tag.includes('hoodie') || tag.includes('top'))) {
        categories['Apparel'].push(product);
      } else if (productType.includes('bag') || productType.includes('tote') ||
                 productType.includes('mug') || productType.includes('bottle') ||
                 productType.includes('accessory') ||
                 tags.some(tag => tag.includes('bag') || tag.includes('mug') || tag.includes('bottle'))) {
        categories['Accessories'].push(product);
      } else if (productType.includes('home') || productType.includes('decor') ||
                 productType.includes('wall') || productType.includes('art') ||
                 tags.some(tag => tag.includes('home') || tag.includes('decor'))) {
        categories['Home & Living'].push(product);
      } else if (productType.includes('gift') || productType.includes('card') ||
                 tags.some(tag => tag.includes('gift') || tag.includes('card'))) {
        categories['Gifts'].push(product);
      } else {
        categories['Other'].push(product);
      }
    });

    return categories;
  };

  const categories = categorizeProducts(products);
  const filteredProducts = selectedCategory === 'all' ? products : categories[selectedCategory] || [];

  // Console log categorization results
  useEffect(() => {
    if (products.length > 0) {
      console.log('\n=== CATEGORIZATION RESULTS ===');
      console.log('Categories:', categories);
      Object.entries(categories).forEach(([categoryName, categoryProducts]) => {
        console.log(`\n${categoryName}: ${categoryProducts.length} products`);
        categoryProducts.forEach(product => {
          console.log(`  - ${product.title} (Type: ${product.productType}, Tags: ${product.tags?.join(', ') || 'None'})`);
        });
      });
    }
  }, [products, categories]);

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

            {/* SEO Content Section - Hidden but accessible to search engines */}
            <div className="sr-only">
              <h2>Eklektik Mama Merch - Abu Dhabi Mum Merch & UAE Mum Gifts</h2>
              <p>
                Discover the best funny mum t-shirts UAE, cool mum accessories, and relatable mum merch 
                at Eklektik Mama shop. Our motherhood merch UAE collection includes gifts for mums Abu Dhabi, 
                honest motherhood merch, and real talk motherhood gifts. Shop drops by Eklektik Mama offer 
                self-care gifts for mums UAE, modern motherhood store UAE products, and mum-owned brand Abu Dhabi 
                merchandise. Find chaos coordinator t-shirts, BYOBaby merch, Eklektik AF membership gear, 
                and anti-perfect mum merch that celebrates the real journey of motherhood.
              </p>
              <h3>Where to Buy Funny Mum Gifts UAE</h3>
              <p>
                Looking for gifts for new mums UAE? Our motherhood apparel Abu Dhabi collection features 
                mum slogan t-shirts, cool mum mugs, funny mum tote bags, and mum life water bottles. 
                As a UAE mum community focused brand, we offer the perfect self-care gifts for mums UAE 
                and relatable gifts that speak to the modern motherhood experience.
              </p>
            </div>

            {/* Membership Discount Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <MembershipDiscount />
            </motion.div>

            {/* Category Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-6xl mx-auto mb-8"
            >
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === 'all'
                      ? 'bg-[#093166] text-white shadow-lg'
                      : 'bg-white text-[#093166] border-2 border-[#093166] hover:bg-[#093166] hover:text-white'
                  }`}
                >
                  All Products
                </button>
                {Object.keys(categories).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-[#093166] text-white shadow-lg'
                        : 'bg-white text-[#093166] border-2 border-[#093166] hover:bg-[#093166] hover:text-white'
                    }`}
                  >
                    {category} ({categories[category].length})
                  </button>
                ))}
              </div>
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
              className="bg-[#093166] text-white p-4 rounded-full hover:bg-[#072a4d] transition-colors duration-300 flex items-center gap-2 relative"
            >
              <BsCart3 className="text-xl" />
              <span className="hidden sm:inline">Cart</span>
              {/* Cart Count Badge */}
              <CartCount />
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
          ) : selectedCategory === 'all' ? (
            <>
              {/* Display all products in categorized sections */}
              {Object.entries(categories).map(([categoryName, categoryProducts], categoryIndex) => {
                if (categoryProducts.length === 0) return null;
                
                return (
                  <motion.div
                    key={categoryName}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 + categoryIndex * 0.1 }}
                    className="max-w-6xl mx-auto mb-16"
                  >
                    {/* Category Header */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-[#093166] mb-2">{categoryName}</h2>
                      <div className="w-24 h-1 bg-[#093166] mx-auto rounded-full"></div>
                    </div>
                    
                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryProducts.map((product, index) => (
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
                    </div>
                  </motion.div>
                );
              })}

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
          ) : (
            <>
              {/* Display filtered products */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-6xl mx-auto"
              >
                {/* Category Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#093166] mb-2">{selectedCategory}</h2>
                  <div className="w-24 h-1 bg-[#093166] mx-auto rounded-full"></div>
                  <p className="text-gray-600 mt-2">{filteredProducts.length} products found</p>
                </div>
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No products in this category</h3>
                    <p className="text-gray-600">Try selecting a different category or view all products.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
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
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* Cart Component */}
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    </MembershipProvider>
  );
}
