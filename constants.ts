
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const LOADING_MESSAGES = {
  START: 'Initializing documentation process...',
  ANALYZE_STRUCTURE: 'Analyzing repository structure...',
  SUMMARIZE_FILES: (filePath: string) => `Summarizing ${filePath}...`,
  SYNTHESIZE_ARCHITECTURE: 'Synthesizing high-level architecture...',
  WRITE_INTRODUCTION: 'Writing project introduction...',
  WRITE_INSTALLATION: 'Generating installation instructions...',
  WRITE_USAGE: 'Creating usage examples...',
  WRITE_API_REFERENCE: 'Building API reference...',
  FINALIZE: 'Finalizing README.md...',
};
