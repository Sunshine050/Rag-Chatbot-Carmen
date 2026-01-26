import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaService } from '../ollama/ollama.service';
import { ChromaDBService } from '../chromadb/chromadb.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private ollamaService: OllamaService,
    private chromaDBService: ChromaDBService,
    private configService: ConfigService,
  ) {}

  async chat(query: string, topK: number = 5) {
    try {
      // 1. Retrieval - Search for relevant documents from ChromaDB
      const searchResults = await this.chromaDBService.search(query, topK);

      // Build context from retrieved documents
      let context = '';
      const sources: string[] = [];

      if (searchResults.length > 0) {
        context = searchResults
          .map((result, index) => {
            const source = result.metadata?.source || `document_${result.id}`;
            if (!sources.includes(source)) {
              sources.push(source);
            }
            return `[Document ${index + 1} from ${source}]:\n${result.content}`;
          })
          .join('\n\n');
      } else {
        context =
          'No relevant documents found in the knowledge base. Please provide general information based on your training.';
        this.logger.warn('No documents found for query, using fallback context');
      }

      // 2. Augmentation - Build prompt with context
      const prompt = `You are a helpful assistant for BlueLedgers Documentation Hub. You can communicate in both Thai and English.

Context from knowledge base:
${context}

Question: ${query}

Please answer the question based on the context provided above. Answer in the same language as the question. If the context doesn't contain relevant information, say so politely in the same language as the question.`;

      // 3. Generation - Generate response using Ollama
      const llmModel = this.configService.get<string>('LLM_MODEL', 'llama3.2');
      const result = await this.ollamaService.generateResponse(llmModel, prompt);

      return {
        answer: result.response,
        sources: sources.length > 0 ? sources : ['No sources found'],
        retrievedDocuments: searchResults.length,
      };
    } catch (error) {
      this.logger.error(`Error in RAG chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a document to the knowledge base
   */
  async addDocument(
    id: string,
    content: string,
    metadata?: { source?: string; title?: string; [key: string]: any },
  ) {
    try {
      await this.chromaDBService.addDocument(id, content, metadata);
      return { success: true, message: `Document ${id} added successfully` };
    } catch (error) {
      this.logger.error(`Error adding document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get collection information
   */
  async getCollectionInfo() {
    try {
      return await this.chromaDBService.getCollectionInfo();
    } catch (error) {
      this.logger.error(`Error getting collection info: ${error.message}`);
      throw error;
    }
  }
}
