/**
 * Import Wiki.js content from Git repository to ChromaDB
 * 
 * This script:
 * 1. Clones/pulls the Git repository
 * 2. Reads Markdown files
 * 3. Splits content into chunks
 * 4. Generates embeddings
 * 5. Imports to ChromaDB
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const GIT_REPO_URL = process.env.WIKI_GIT_REPO_URL || 'git@github.com:Sunshine050/Rag-Chatbot-Carmen.git';
const REPO_DIR = path.join(__dirname, '../../wiki-repo');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks

interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    title?: string;
    filePath: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

/**
 * Clone or pull repository
 */
function syncRepository(): void {
  console.log('📥 Syncing repository...');
  
  if (fs.existsSync(REPO_DIR)) {
    console.log('Repository exists, pulling latest changes...');
    try {
      execSync('git pull', { cwd: REPO_DIR, stdio: 'inherit' });
    } catch (error) {
      console.error('Error pulling repository:', error);
      throw error;
    }
  } else {
    console.log('Cloning repository...');
    try {
      execSync(`git clone ${GIT_REPO_URL} ${REPO_DIR}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Error cloning repository:', error);
      throw error;
    }
  }
  
  console.log('✅ Repository synced successfully');
}

/**
 * Find all Markdown files in repository
 */
function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip .git directory
    if (file === '.git') {
      return;
    }
    
    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.markdown')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Read and parse Markdown file
 */
function readMarkdownFile(filePath: string): { content: string; title: string } {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract title from first H1 or filename
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch 
    ? titleMatch[1].trim() 
    : path.basename(filePath, path.extname(filePath));
  
  return { content, title };
}

/**
 * Split content into chunks
 */
function splitIntoChunks(content: string, filePath: string, title: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const lines = content.split('\n');
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const line of lines) {
    // If adding this line would exceed chunk size, save current chunk
    if (currentChunk.length + line.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: `${path.basename(filePath)}-chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          source: 'wiki',
          title,
          filePath: path.relative(REPO_DIR, filePath),
          chunkIndex,
          totalChunks: 0, // Will be updated later
        },
      });
      
      // Start new chunk with overlap
      const overlapText = currentChunk.slice(-CHUNK_OVERLAP);
      currentChunk = overlapText + '\n' + line;
      chunkIndex++;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  
  // Add remaining content as last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: `${path.basename(filePath)}-chunk-${chunkIndex}`,
      content: currentChunk.trim(),
      metadata: {
        source: 'wiki',
        title,
        filePath: path.relative(REPO_DIR, filePath),
        chunkIndex,
        totalChunks: 0, // Will be updated later
      },
    });
  }
  
  // Update totalChunks for all chunks
  chunks.forEach((chunk) => {
    chunk.metadata.totalChunks = chunks.length;
  });
  
  return chunks;
}

/**
 * Import document to ChromaDB via API
 */
async function importDocument(chunk: DocumentChunk): Promise<void> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/documents`, {
      id: chunk.id,
      content: chunk.content,
      metadata: chunk.metadata,
    });
    
    if (response.status === 201 || response.status === 200) {
      console.log(`✅ Imported: ${chunk.metadata.title} (chunk ${chunk.metadata.chunkIndex + 1}/${chunk.metadata.totalChunks})`);
    }
  } catch (error: any) {
    if (error.response) {
      console.error(`❌ Error importing ${chunk.id}:`, error.response.data);
    } else {
      console.error(`❌ Error importing ${chunk.id}:`, error.message);
    }
    throw error;
  }
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Wiki.js to RAG import...\n');
  
  try {
    // Step 1: Sync repository
    syncRepository();
    
    // Step 2: Find all Markdown files
    console.log('\n📄 Finding Markdown files...');
    const markdownFiles = findMarkdownFiles(REPO_DIR);
    console.log(`Found ${markdownFiles.length} Markdown files`);
    
    if (markdownFiles.length === 0) {
      console.log('⚠️  No Markdown files found. Make sure Wiki.js has synced content to Git.');
      return;
    }
    
    // Step 3: Process each file
    console.log('\n📝 Processing files...\n');
    let totalChunks = 0;
    
    for (const filePath of markdownFiles) {
      try {
        const { content, title } = readMarkdownFile(filePath);
        const chunks = splitIntoChunks(content, filePath, title);
        
        console.log(`\n📄 Processing: ${title} (${chunks.length} chunks)`);
        
        // Step 4: Import each chunk
        for (const chunk of chunks) {
          await importDocument(chunk);
          totalChunks++;
          
          // Small delay to avoid overwhelming the API
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }
    
    console.log(`\n✅ Import completed! Total chunks imported: ${totalChunks}`);
    
    // Step 5: Get collection info
    try {
      const infoResponse = await axios.get(`${BACKEND_URL}/api/documents/info`);
      console.log('\n📊 Collection Info:', JSON.stringify(infoResponse.data, null, 2));
    } catch (error) {
      console.log('\n⚠️  Could not fetch collection info');
    }
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
