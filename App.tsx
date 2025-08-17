
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { RepoInput } from './components/RepoInput';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ReadmeDisplay } from './components/ReadmeDisplay';
import { generateDocumentation } from './services/geminiService';
import { GitHubIcon } from './components/icons';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedReadme, setGeneratedReadme] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    // Basic URL validation
    if (!/^(https|http):\/\/github\.com\/[\w-]+\/[\w-.]+$/.test(repoUrl)) {
        setError('Invalid GitHub repository URL. Format should be: https://github.com/user/repo');
        return;
    }

    setIsLoading(true);
    setGeneratedReadme('');
    setError(null);

    try {
      const readmeStream = generateDocumentation(repoUrl, setLoadingMessage);
      let readmeContent = '';
      for await (const section of readmeStream) {
        readmeContent += section;
        setGeneratedReadme(readmeContent);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate documentation. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [repoUrl]);
  
  const handleUseSample = useCallback(() => {
    setRepoUrl('https://github.com/reactjs/reactjs.org');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Generate Your README in Seconds
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-400">
            RepoScripter uses AI to analyze your codebase and autonomously generate comprehensive, high-quality documentation.
          </p>
        </div>

        <div className="mt-12 max-w-2xl mx-auto">
          <RepoInput
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            onUseSample={handleUseSample}
          />
        </div>
        
        {error && (
          <div className="mt-8 max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
            <p>{error}</p>
          </div>
        )}

        {isLoading && <LoadingIndicator message={loadingMessage} />}

        {generatedReadme && !isLoading && <ReadmeDisplay readmeContent={generatedReadme} />}

        <footer className="text-center mt-20 py-6 border-t border-gray-800">
          <p className="text-gray-500">
            Built with React, TypeScript, and the Gemini API.
          </p>
           <a
            href="https://github.com/google/genai-js"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-gray-400 hover:text-white transition-colors"
          >
            <GitHubIcon className="w-5 h-5" />
            View on GitHub
          </a>
        </footer>
      </main>
    </div>
  );
};

export default App;
