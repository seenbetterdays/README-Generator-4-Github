
import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import { Remarkable } from 'remarkable';

const md = new Remarkable({
  html: true,
  breaks: true,
  linkify: true,
});

interface ReadmeDisplayProps {
  readmeContent: string;
}

export const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ readmeContent }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');

  useEffect(() => {
    setRenderedHtml(md.render(readmeContent));
  }, [readmeContent]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(readmeContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-gray-700/50 flex justify-between items-center border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Generated README.md</h3>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium text-gray-200 transition-colors disabled:opacity-50"
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>
        <div 
            className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none p-6"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
};
