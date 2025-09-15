'use client';

import { useState, useEffect } from 'react';
import { BsShare, BsInstagram, BsFacebook, BsTwitter, BsLink45Deg } from 'react-icons/bs';

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
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  const handleSocialShare = (platform) => {
    if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing, so we'll copy the link
      handleCopyLink();
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

      {/* Twitter Share */}
      <button
        onClick={() => handleSocialShare('twitter')}
        className="flex items-center px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1A91DA] transition-colors duration-200"
      >
        <BsTwitter className="mr-2" />
        Twitter
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

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Share on Instagram:</strong> Copy the link above and paste it in your Instagram story or post.
          </p>
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

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Share on Instagram:</strong> Copy the link and paste it in your Instagram story or post.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialShare;
