const express = require('express');
const path = require('path');
const { indexSyllabus, searchSimilarity } = require('../services/ragService');

const router = express.Router();

// One-time indexing endpoint
router.post('/index', async (req, res, next) => {
  try {
    const syllabusPath = path.join(__dirname, '../course-syllabus.pdf');
    const chunkCount = await indexSyllabus(syllabusPath);
    res.json({ message: `Indexed ${chunkCount} chunks from syllabus` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// The RAG query endpoint
router.post('/ask', async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const topChunks = await searchSimilarity(question, 3);
    const context = topChunks.map(c => c.chunk).join('\n\n---\n\n');

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not defined in the backend environment variables' });
    }

    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful StudyStack Assistant. Answer the user's question using the provided course syllabus context. If the context doesn't contain the answer, use your general programming knowledge to answer helpful and clearly, but mention that it is not explicitly stated in the syllabus."
          },
          {
            role: "user",
            content: `Syllabus Context:\n${context}\n\nQuestion: ${question}`
          }
        ],
        temperature: 0.3,
        max_tokens: 650
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    res.json({
      answer: answer,
      sources: topChunks.map(c => c.chunk.slice(0, 100) + '...')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
