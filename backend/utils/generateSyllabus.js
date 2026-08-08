const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateSyllabus(filePath) {
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(24).text('StudyStack Web Development and GenAI Course Syllabus', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Course Description:', { underline: true });
  doc.fontSize(12).text(
    'Welcome to StudyStack! This course covers advanced backend web development, database management with MongoDB, and integrating Generative AI features such as Retrieval-Augmented Generation chatbot services into your applications.'
  );
  doc.moveDown();

  doc.fontSize(14).text('Module 1: Node.js and Express Basics', { underline: true });
  doc.fontSize(12).text(
    'Learn how Node.js works asynchronously. Set up Express.js applications, handle HTTP methods, build routers, controllers, and custom middleware including loggers and centralized error-handling systems.'
  );
  doc.moveDown();

  doc.fontSize(14).text('Module 2: Mongoose and MongoDB Integration', { underline: true });
  doc.fontSize(12).text(
    'Configure database connections using Mongoose. Define Course and User schemas and models. Set up relationship constraints and write CRUD controllers for fetching, creating, updating, and deleting records.'
  );
  doc.moveDown();

  doc.fontSize(14).text('Module 3: Authentication and Security', { underline: true });
  doc.fontSize(12).text(
    'Secure application endpoints with JSON Web Tokens JWT. Hash user passwords with bcrypt before saving them to the database. Build a role-based authorization system separating students from instructors.'
  );
  doc.moveDown();

  doc.fontSize(14).text('Module 4: Generative AI and Retrieval-Augmented Generation RAG', { underline: true });
  doc.fontSize(12).text(
    'Understand how embeddings work. Convert document chunks into vectors using Gemini Text Embedding models. Perform cosine similarity checks on user queries against stored vector chunks to retrieve relevant context. Ground the LLM responses using system instructions to prevent hallucinations.'
  );

  doc.end();
  stream.on('finish', () => {
    console.log(`Default syllabus PDF generated successfully at: ${filePath}`);
    process.exit(0);
  });
  stream.on('error', (err) => {
    console.error('PDF Generation failed:', err);
    process.exit(1);
  });
}

// Get file path from command line arguments
const targetPath = process.argv[2] || './course-syllabus.pdf';
generateSyllabus(targetPath);
