'use client';

import { useState, useEffect } from 'react';
import { BsShare, BsInstagram, BsFacebook, BsLink45Deg } from 'react-icons/bs';

// Custom Threads icon component
const ThreadsIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M12.001.007C5.326.007.007 5.326.007 12S5.326 23.995 12.001 23.995 23.995 18.675 23.995 12 18.675.007 12.001.007zm3.202 13.539c-.337 1.621-1.613 3.102-3.317 3.102-1.783 0-3.24-1.657-3.24-3.688 0-2.032 1.457-3.688 3.24-3.688.95 0 1.829.352 2.475.943l-.793.793c-.449-.449-1.056-.695-1.682-.695-1.305 0-2.366 1.177-2.366 2.647 0 1.47 1.061 2.647 2.366 2.647.89 0 1.658-.503 2.047-1.228h-2.047v-1.068h3.318c.033.18.05.361.05.554 0 1.661-1.127 3.063-2.624 3.392zm.11-2.83h-1.179l-.007.039h1.186v-.039z"/>
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
    threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(title + ' ' + url)}`,
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

      {/* Threads Share */}
      <button
        onClick={() => handleSocialShare('threads')}
        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
      >
        <ThreadsIcon className="mr-2 w-4 h-4" />
        Threads
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
          </div>
        </div>
      )}
    </>
  );
};

export default SocialShare;
