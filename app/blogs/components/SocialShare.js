'use client';

import { useState, useEffect } from 'react';
import { BsShare, BsInstagram, BsFacebook, BsLink45Deg } from 'react-icons/bs';

// Custom X (Twitter) icon component
const XIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SocialShare = ({ title, url, description, showFloating = true }) => {
  const [copied, setCopied] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!showFloating) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowFloatingButton(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showFloating]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing
    twitter: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  const handleSocialShare = (platform) => {
    if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing, so we'll copy the link
      handleCopyLink();
      
      // Show Instagram sharing instructions
      setTimeout(() => {
        alert(`Link copied! 📱\n\nTo share on Instagram:\n1. Open Instagram app\n2. Create a new story\n3. Add the link as a sticker\n4. Or paste it in your caption\n\nTip: You can also screenshot this article and share it as an image!`);
      }, 100);
      return;
    }
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const ShareButtons = ({ isModal = false }) => (
    <div className={`flex ${isModal ? 'flex-col gap-3' : 'flex-wrap gap-3'}`}>
      {/* Facebook Share */}
      <button
        onClick={() => handleSocialShare('facebook')}
        className="flex items-center px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors duration-200"
      >
        <BsFacebook className="mr-2" />
        Facebook
      </button>

      {/* Instagram Share */}
      <button
        onClick={() => handleSocialShare('instagram')}
        className="flex items-center px-4 py-2 bg-gradient-to-r from-[#E4405F] to-[#C13584] text-white rounded-lg hover:from-[#D63384] hover:to-[#B02A5B] transition-all duration-200"
      >
        <BsInstagram className="mr-2" />
        Instagram
      </button>

      {/* X (Twitter) Share */}
      <button
        onClick={() => handleSocialShare('twitter')}
        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
      >
        <XIcon className="mr-2 w-4 h-4" />
        X
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <BsLink45Deg className="mr-2" />
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );

  return (
    <>
      {/* Main Share Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BsShare className="mr-2 text-[#bf378b]" />
          Share this article
        </h3>
        
        <ShareButtons />

        {copied && (
          <p className="text-sm text-green-600 mt-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Link copied to clipboard!
          </p>
        )}

        <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>📱 Share on Instagram:</strong> Click the Instagram button to copy the link, then:
          </p>
          <ul className="text-xs text-gray-600 mt-2 ml-4 list-disc">
            <li>Add as a link sticker in your story</li>
            <li>Paste in your post caption</li>
            <li>Screenshot and share as an image</li>
          </ul>
        </div>
      </div>

      {/* Floating Share Button */}
      {showFloating && showFloatingButton && (
        <button
          onClick={() => setShowShareModal(true)}
          className="fixed bottom-6 right-6 bg-[#bf378b] text-white p-4 rounded-full shadow-lg hover:bg-[#a02d6b] transition-all duration-300 z-50"
          aria-label="Share article"
        >
          <BsShare className="text-xl" />
        </button>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BsShare className="mr-2 text-[#bf378b]" />
                Share this article
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <ShareButtons isModal={true} />

            {copied && (
              <p className="text-sm text-green-600 mt-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Link copied to clipboard!
              </p>
            )}

            <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>📱 Share on Instagram:</strong> Click the Instagram button to copy the link, then:
              </p>
              <ul className="text-xs text-gray-600 mt-2 ml-4 list-disc">
                <li>Add as a link sticker in your story</li>
                <li>Paste in your post caption</li>
                <li>Screenshot and share as an image</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialShare;
