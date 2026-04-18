import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const mongoUri = process.env.MONGODB_ATLAS_URI;
  const client = mongoUri ? new MongoClient(mongoUri) : null;

  // AI Configuration for Search
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "text-embedding-004",
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      database: !!client ? 'connected' : 'not_configured',
      service: 'IurisBubble Search Server'
    });
  });

  app.post('/api/search', async (req, res) => {
    if (!client) return res.status(500).json({ error: 'MongoDB Atlas URI not configured' });

    try {
      const { message } = req.body;
      await client.connect();
      const db = client.db("sistema_legal_db");
      const collection = db.collection("expedientes");

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection as any,
        indexName: "vector_index",
        textKey: "embedding_text",
        embeddingKey: "embedding",
      });

      const relevantDocs = await vectorStore.similaritySearch(message, 4);
      const context = relevantDocs.map(doc => doc.pageContent).join('\n\n---\n\n');
      const sources = Array.from(new Set(relevantDocs.map(d => d.metadata.nombre_oficial || 'Documento sin nombre')));

      res.json({ context, sources });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Failed to search documents', details: String(error) });
    } finally {
      await client.close();
    }
  });

  // PDF Upload and Indexing
  app.post('/api/upload', express.raw({ type: 'application/pdf', limit: '10mb' }), async (req, res) => {
    if (!client) return res.status(500).json({ error: 'MongoDB Atlas URI not configured' });

    try {
      const parser = new PDFParse({ data: req.body });
      const result = await parser.getText();
      const text = result.text;
      
      let fileName = 'Documento Analizado';
      const b64Name = req.headers['x-file-name-b64'];
      if (typeof b64Name === 'string') {
        try {
          fileName = decodeURIComponent(escape(atob(b64Name)));
        } catch (e) {
          console.error("Filename decode failed", e);
        }
      }

      await client.connect();
      const db = client.db("sistema_legal_db");
      const collection = db.collection("expedientes");

      // Split into digestible chunks for the embedding model
      const chunks = text.split('\n\n').filter(c => c.length > 50).slice(0, 100); // Limit chunks for now

      const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection: collection as any,
        indexName: "vector_index",
        textKey: "embedding_text",
        embeddingKey: "embedding",
      });

      await vectorStore.addDocuments(chunks.map(chunk => ({
        pageContent: chunk,
        metadata: { nombre_oficial: fileName, analyzedAt: new Date() }
      })));

      res.json({ success: true, chunksIndexed: chunks.length });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to index PDF', details: String(error) });
    } finally {
      await client.close();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
