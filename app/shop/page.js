'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { BsArrowRight, BsShop } from 'react-icons/bs';

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" style={{ paddingTop: '10em' }}>
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="text-6xl mb-4">🛍️</div>
          <h1 className="text-5xl md:text-7xl font-antonio font-bold text-[#093166] mb-4">
            SHOP
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get ready for something amazing! Our shop is coming soon with exclusive Eklektik Mama merchandise and curated products.
          </p>
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-16 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-8xl mb-6">🚀</div>
            <h2 className="text-4xl md:text-5xl font-antonio font-bold text-[#093166] mb-6">
              COMING SOON
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're crafting something special for our amazing community. Get ready for exclusive merchandise, 
              curated products, and everything that makes Eklektik Mama unique.
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "30%" }}
                transition={{ duration: 2, delay: 1 }}
                className="bg-gradient-to-r from-[#093166] to-[#DB4E9F] h-3 rounded-full"
              />
            </div>
            
            <p className="text-sm text-gray-500 mb-8">
              Development Progress: 30% Complete
            </p>
          </div>
        </motion.div>

        {/* What's Coming Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {/* Category 1 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">👕</div>
            <h3 className="text-xl font-bold text-[#093166] mb-3">Apparel & Merchandise</h3>
            <p className="text-gray-600">
              Exclusive Eklektik Mama branded clothing, accessories, and lifestyle products.
            </p>
          </div>

          {/* Category 2 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-[#093166] mb-3">Curated Collections</h3>
            <p className="text-gray-600">
              Handpicked products from our favorite brands and local artisans.
            </p>
          </div>

          {/* Category 3 */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-xl font-bold text-[#093166] mb-3">Exclusive Events</h3>
            <p className="text-gray-600">
              Special shopping events, pop-ups, and member-only experiences.
            </p>
          </div>
        </motion.div>



        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center space-y-4"
        >
          <Link
            href="/events"
            className="inline-flex items-center gap-3 bg-[#093166] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#072a4d] transition-colors duration-300 text-lg"
          >
            <BsShop className="text-xl" />
            Browse Events Instead
            <BsArrowRight className="text-xl" />
          </Link>
          
          <div className="text-gray-500">
            <p>Can't wait? Check out our upcoming events while you wait!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
