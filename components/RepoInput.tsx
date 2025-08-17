
import React from 'react';
import { GitHubIcon } from './icons';

interface RepoInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onUseSample: () => void;
}

export const RepoInput: React.FC<RepoInputProps> = ({ repoUrl, setRepoUrl, onGenerate, isLoading, onUseSample }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <GitHubIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors flex-grow"
            disabled={isLoading}
        >
            {isLoading ? 'Generating...' : 'Generate Documentation'}
        </button>
        <button
            type="button"
            onClick={onUseSample}
            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors"
            disabled={isLoading}
        >
            Use Sample
        </button>
      </div>
    </form>
  );
};
