const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { execSync } = require('child_process');

// In-memory Vector Store: stores [{ chunk: "...", vector: { word: freq } }]
let vectorStore = [];

const DEFAULT_SYLLABUS_TEXT = `StudyStack Web Development and GenAI Course Syllabus
Course Description:
Welcome to StudyStack! This course covers advanced backend web development, database management with MongoDB, and integrating Generative AI features such as Retrieval-Augmented Generation RAG chatbot services into your applications.

Module 1: Node.js and Express Basics
Learn how Node.js works asynchronously. Set up Express.js applications, handle HTTP methods, build routers, controllers, and custom middleware including loggers and centralized error-handling systems.

Module 2: Mongoose and MongoDB Integration
Configure database connections using Mongoose. Define Course and User schemas and models. Set up relationship constraints and write CRUD controllers for fetching, creating, updating, and deleting records.

Module 3: Authentication and Security
Secure application endpoints with JSON Web Tokens JWT. Hash user passwords with bcrypt before saving them to the database. Build a role-based authorization system separating students from instructors.

Module 4: Generative AI and Retrieval-Augmented Generation RAG
Understand how embeddings work. Convert document chunks into vectors using Gemini Text Embedding models. Perform cosine similarity checks on user queries against stored vector chunks to retrieve relevant context. Ground the LLM responses using system instructions to prevent hallucinations.`;

// Helper to generate default syllabus if missing (runs in child process to isolate imports)
function generateDefaultSyllabus(filePath) {
  try {
    const generatorPath = path.join(__dirname, '../utils/generateSyllabus.js');
    console.log(`Executing isolated PDF generator script: ${generatorPath}`);
    execSync(`node "${generatorPath}" "${filePath}"`, { stdio: 'inherit' });
    console.log(`Self-healing syllabus generation completed.`);
  } catch (err) {
    console.warn(`Self-healing PDF generation failed: ${err.message}`);
  }
}

// 1. Text Extraction (with self-healing fallback)
async function extractText(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Syllabus PDF missing. Initiating self-healing generation at: ${filePath}`);
      generateDefaultSyllabus(filePath);
    }
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return data.text;
  } catch (err) {
    console.warn(`PDF parser failed (${err.message}). Falling back to robust default syllabus text.`);
    return DEFAULT_SYLLABUS_TEXT;
  }
}

// 2. Text Chunking
function chunkText(text, chunkSize = 150, overlap = 30) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 10) {
      chunks.push(chunk);
    }
  }
  return chunks;
}

// 3. Local Term Frequency Vectorizer (Key-less local embeddings)
function getTermVector(text) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2); // Filter out short stop-words/characters

  const freqs = {};
  for (const w of words) {
    freqs[w] = (freqs[w] || 0) + 1;
  }
  return freqs;
}

// 4. Cosine Similarity on Sparse Word-Frequency Vectors
function calculateCosineSimilarity(vecA, vecB) {
  const uniqueWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const w of uniqueWords) {
    const valA = vecA[w] || 0;
    const valB = vecB[w] || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  }

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

// 5. Indexing the Chunks
async function indexSyllabus(filePath) {
  console.log(`Indexing syllabus PDF: ${filePath}...`);
  const text = await extractText(filePath);
  const chunks = chunkText(text);
  
  vectorStore = [];
  for (const chunk of chunks) {
    const vector = getTermVector(chunk);
    vectorStore.push({ chunk, vector });
  }
  console.log(`Indexing completed! Indexed ${vectorStore.length} chunks locally.`);
  return vectorStore.length;
}

// 6. Searching similarity
async function searchSimilarity(query, topK = 3) {
  if (vectorStore.length === 0) {
    // If empty, auto-trigger indexing to make it self-healing
    const syllabusPath = path.join(__dirname, '../course-syllabus.pdf');
    await indexSyllabus(syllabusPath);
  }
  
  const queryVector = getTermVector(query);
  const scored = vectorStore.map(item => ({
    chunk: item.chunk,
    score: calculateCosineSimilarity(queryVector, item.vector)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = {
  indexSyllabus,
  searchSimilarity
};
