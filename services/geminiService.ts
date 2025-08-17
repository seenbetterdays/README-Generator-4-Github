
import { GoogleGenAI } from "@google/genai";
import { MockRepository, FileSummary } from '../types';
import { GEMINI_MODEL, LOADING_MESSAGES } from '../constants';

// This is a necessary simulation as we cannot access file systems or clone repos from the browser.
// This mock represents a simple Express.js API server.
const MOCK_REPO_DATA: MockRepository = {
  'package.json': JSON.stringify({
    "name": "simple-user-api",
    "version": "1.0.0",
    "description": "A simple API to manage users",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.17.1"
    }
  }, null, 2),
  'server.js': `
const express = require('express');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Main entry point for user routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
  `,
  'routes/users.js': `
const express = require('express');
const router = express.Router();

// In-memory data store (for demonstration)
let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];

// GET all users
router.get('/', (req, res) => {
  res.json(users);
});

// GET a single user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found.');
  res.json(user);
});

// POST a new user
router.post('/', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;
  `,
  '.gitignore': `
node_modules
.env
  `,
};


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Agent 1: File-Level Summarizer
const summarizeFile = async (path: string, content: string): Promise<FileSummary> => {
  const prompt = `You are a File-Level Summarizer Agent. Your task is to generate a concise, one-paragraph summary of the following file's purpose, its main functions or classes, and its key responsibilities within the project. Focus on the high-level logic, not line-by-line details.

File Path: \`${path}\`

File Content:
\`\`\`
${content}
\`\`\`

Summary:`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt
  });
  return { path, summary: response.text };
};

// Agent 2: Architectural Synthesizer
const synthesizeArchitecture = async (structure: string, dependencies: string, summaries: FileSummary[]): Promise<string> => {
  const summariesText = summaries.map(s => `**${s.path}**: ${s.summary}`).join('\n');
  const prompt = `You are an Architectural Synthesizer Agent. Based on the following file structure, dependencies, and file summaries, infer the project's overall purpose and architecture. Provide a concise, high-level overview in 2-3 sentences.

File Structure:
\`\`\`
${structure}
\`\`\`

Dependencies (from package.json):
\`\`\`json
${dependencies}
\`\`\`

File Summaries:
${summariesText}

Project Overview:`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt
  });
  return response.text;
};

// Agent 3: Section-Specific Writer
const writeSection = async (section: string, archSummary: string, context: string): Promise<string> => {
  const prompt = `You are a professional technical writer, an expert in creating README.md files. Your current task is to write the "${section}" section.
  
Project Architectural Overview: "${archSummary}"

Use the following specific context to write a clear and concise "${section}" section in Markdown format.

Context:
${context}

## ${section}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt
  });
  return `## ${section}\n\n${response.text}\n\n`;
}


export async function* generateDocumentation(
  repoUrl: string,
  setLoadingMessage: (message: string) => void
): AsyncGenerator<string, void, undefined> {

  setLoadingMessage(LOADING_MESSAGES.START);
  const repoName = repoUrl.split('/').pop() || 'New Project';
  yield `# ${repoName}\n\n`;

  // --- Step 1: File-Level Summaries ---
  setLoadingMessage(LOADING_MESSAGES.ANALYZE_STRUCTURE);
  const filesToSummarize = Object.entries(MOCK_REPO_DATA)
    .filter(([path]) => path.endsWith('.js'));
  
  const summaries: FileSummary[] = [];
  for (const [path, content] of filesToSummarize) {
    setLoadingMessage(LOADING_MESSAGES.SUMMARIZE_FILES(path));
    const summary = await summarizeFile(path, content);
    summaries.push(summary);
  }

  // --- Step 2: Architectural Synthesis ---
  setLoadingMessage(LOADING_MESSAGES.SYNTHESIZE_ARCHITECTURE);
  const fileStructure = Object.keys(MOCK_REPO_DATA).map(f => `- ${f}`).join('\n');
  const dependencies = MOCK_REPO_DATA['package.json'];
  const archSummary = await synthesizeArchitecture(fileStructure, dependencies, summaries);
  
  setLoadingMessage(LOADING_MESSAGES.WRITE_INTRODUCTION);
  yield `${archSummary}\n\n`;

  // --- Step 3: Section-Specific Writing ---
  
  // Installation Section
  setLoadingMessage(LOADING_MESSAGES.WRITE_INSTALLATION);
  const installationContext = `Dependencies file (package.json):\n\`\`\`json\n${dependencies}\n\`\`\``;
  const installationSection = await writeSection("Installation", archSummary, installationContext);
  yield installationSection;

  // Usage Section
  setLoadingMessage(LOADING_MESSAGES.WRITE_USAGE);
  const mainFileSummary = summaries.find(s => s.path === 'server.js')?.summary;
  const usageContext = `The main entry point is \`server.js\`. Its summary is: "${mainFileSummary}". Based on the package.json, the start command is likely "npm start".`;
  const usageSection = await writeSection("Usage", archSummary, usageContext);
  yield usageSection;
  
  // API Reference Section
  setLoadingMessage(LOADING_MESSAGES.WRITE_API_REFERENCE);
  const apiRoutesSummary = summaries.find(s => s.path === 'routes/users.js')?.summary;
  const apiContext = `API routes are defined in \`routes/users.js\`. The summary is: "${apiRoutesSummary}". List the available endpoints and their purpose based on this summary.`;
  const apiSection = await writeSection("API Reference", archSummary, apiContext);
  yield apiSection;

  setLoadingMessage(LOADING_MESSAGES.FINALIZE);
}
