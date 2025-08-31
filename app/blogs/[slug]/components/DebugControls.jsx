'use client';

import { useState } from 'react';

const DebugControls = ({ blogContent }) => {
  const [showRawContent, setShowRawContent] = useState(false);

  const logContentToConsole = () => {
    console.log('Raw blog content:', blogContent);
    console.log('Content structure:', JSON.stringify(blogContent, null, 2));
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-semibold text-blue-800 mb-2">Debug Controls</h3>
      <div className="space-y-2">
        <button 
          onClick={logContentToConsole}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Log Content to Console
        </button>
        
        <button 
          onClick={() => setShowRawContent(!showRawContent)}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors ml-2"
        >
          {showRawContent ? 'Hide' : 'Show'} Raw Content
        </button>
      </div>
      
      {showRawContent && (
        <div className="mt-4 p-3 bg-white border rounded">
          <h4 className="font-semibold text-sm mb-2">Raw Content Structure:</h4>
          <pre className="text-xs overflow-auto max-h-64 bg-gray-100 p-2 rounded">
            {JSON.stringify(blogContent, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugControls;

