import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, CloudClient } from 'chromadb';
import { OllamaService } from '../ollama/ollama.service';

export interface DocumentMetadata {
  source?: string;
  title?: string;
  page?: number;
  [key: string]: any;
}

export interface Document {
  id: string;
  content: string;
  metadata?: DocumentMetadata;
}

export interface SearchResult {
  id: string;
  content: string;
  metadata?: DocumentMetadata;
  distance?: number;
}

@Injectable()
export class ChromaDBService implements OnModuleInit {
  private readonly logger = new Logger(ChromaDBService.name);
  private client: ChromaClient | CloudClient;
  private collectionName: string;
  private embeddingModel: string;
  private collection: any;

  constructor(
    private configService: ConfigService,
    private ollamaService: OllamaService,
  ) {
    const chromaUrl = this.configService.get<string>(
      'CHROMA_URL',
      'http://localhost:8000',
    );
    const chromaApiKey = this.configService.get<string>('CHROMA_API_KEY');
    const chromaTenant = this.configService.get<string>('CHROMA_TENANT');
    const chromaDatabase = this.configService.get<string>('CHROMA_DATABASE');
    this.collectionName = this.configService.get<string>(
      'CHROMA_COLLECTION_NAME',
      'rag_documents',
    );
    this.embeddingModel = this.configService.get<string>(
      'EMBEDDING_MODEL',
      'nomic-embed-text',
    );

    // Initialize ChromaDB Client
    // Priority: CloudClient (if API Key, Tenant, and Database are provided) > ChromaClient
    try {
      // Use CloudClient if all required cloud parameters are provided
      if (chromaApiKey && chromaTenant && chromaDatabase) {
        this.client = new CloudClient({
          apiKey: chromaApiKey,
          tenant: chromaTenant,
          database: chromaDatabase,
        });
        this.logger.log(
          `ChromaDB Cloud Client initialized for database: ${chromaDatabase}`,
        );
      } else {
        // Use regular ChromaClient for local or URL-based connections
        const clientConfig: any = {};

        if (
          chromaUrl.startsWith('http://') ||
          chromaUrl.startsWith('https://')
        ) {
          // Use path for full URL (supports ChromaDB Cloud URLs)
          clientConfig.path = chromaUrl;
        } else {
          // Parse host and port from URL or use defaults
          const url = new URL(`http://${chromaUrl}`);
          clientConfig.host = url.hostname;
          clientConfig.port = parseInt(url.port) || 8000;
          clientConfig.ssl = url.protocol === 'https:';
        }

        // Add API Key authentication for ChromaDB Cloud (if using URL-based connection)
        if (chromaApiKey) {
          clientConfig.headers = {
            'X-Chroma-Token': chromaApiKey,
          };
          this.logger.log('ChromaDB Cloud authentication enabled (URL-based)');
        }

        this.client = new ChromaClient(clientConfig);
      }
    } catch (error) {
      // Fallback to default localhost connection
      this.client = new ChromaClient({
        host: 'localhost',
        port: 8000,
      });
      this.logger.warn(
        `Failed to initialize ChromaDB client, using default localhost:8000`,
      );
    }
  }

  async onModuleInit() {
    try {
      await this.initializeCollection();
      this.logger.log('ChromaDB service initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize ChromaDB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize or get the collection
   */
  private async initializeCollection() {
    try {
      // Try to get existing collection first
      try {
        this.collection = await this.client.getCollection({
          name: this.collectionName,
        });
        this.logger.log(`Collection '${this.collectionName}' found`);
      } catch (error) {
        // If collection doesn't exist, create it
        this.logger.log(
          `Collection '${this.collectionName}' not found, creating new one...`,
        );
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata: {
            description: 'RAG documents collection for BlueLedgers',
          },
        });
        this.logger.log(`Collection '${this.collectionName}' created`);
      }
    } catch (error) {
      this.logger.error(`Error initializing collection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embedding for a text using Ollama
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const embedding = await this.ollamaService.generateEmbedding(
        this.embeddingModel,
        text,
      );
      return embedding;
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add a single document to ChromaDB
   */
  async addDocument(
    id: string,
    content: string,
    metadata?: DocumentMetadata,
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [content],
        metadatas: metadata ? [metadata] : undefined,
      });

      this.logger.log(`Document added with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error adding document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add multiple documents to ChromaDB in batch
   */
  async addDocuments(documents: Document[]): Promise<void> {
    try {
      if (documents.length === 0) {
        this.logger.warn('No documents to add');
        return;
      }

      // Generate embeddings for all documents
      const embeddings = await Promise.all(
        documents.map((doc) => this.generateEmbedding(doc.content)),
      );

      const ids = documents.map((doc) => doc.id);
      const contents = documents.map((doc) => doc.content);
      const metadatas = documents.map((doc) => doc.metadata || {});

      await this.collection.add({
        ids,
        embeddings,
        documents: contents,
        metadatas,
      });

      this.logger.log(`Added ${documents.length} documents to ChromaDB`);
    } catch (error) {
      this.logger.error(`Error adding documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for similar documents using query text
   */
  async search(
    query: string,
    topK: number = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build query options
      const queryOptions: any = {
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
      };

      if (filter) {
        queryOptions.where = filter;
      }

      // Perform the search
      const results = await this.collection.query(queryOptions);

      // Transform results to SearchResult format
      const searchResults: SearchResult[] = [];

      if (results.ids && results.ids[0]) {
        for (let i = 0; i < results.ids[0].length; i++) {
          searchResults.push({
            id: results.ids[0][i],
            content: results.documents[0][i],
            metadata: results.metadatas[0][i] || {},
            distance: results.distances?.[0]?.[i],
          });
        }
      }

      this.logger.log(
        `Found ${searchResults.length} results for query: ${query.substring(0, 50)}...`,
      );

      return searchResults;
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument(id: string): Promise<Document | null> {
    try {
      const result = await this.collection.get({
        ids: [id],
      });

      if (result.ids.length === 0) {
        return null;
      }

      return {
        id: result.ids[0],
        content: result.documents[0],
        metadata: result.metadatas[0] || {},
      };
    } catch (error) {
      this.logger.error(`Error getting document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all documents (with optional filter)
   */
  async getAllDocuments(filter?: Record<string, any>): Promise<Document[]> {
    try {
      const queryOptions: any = {};

      if (filter) {
        queryOptions.where = filter;
      }

      const results = await this.collection.get(queryOptions);

      const documents: Document[] = [];

      if (results.ids) {
        for (let i = 0; i < results.ids.length; i++) {
          documents.push({
            id: results.ids[i],
            content: results.documents[i],
            metadata: results.metadatas[i] || {},
          });
        }
      }

      return documents;
    } catch (error) {
      this.logger.error(`Error getting all documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument(
    id: string,
    content?: string,
    metadata?: DocumentMetadata,
  ): Promise<void> {
    try {
      // If content is provided, regenerate embedding
      if (content) {
        const embedding = await this.generateEmbedding(content);

        await this.collection.update({
          ids: [id],
          embeddings: [embedding],
          documents: [content],
          metadatas: metadata ? [metadata] : undefined,
        });
      } else if (metadata) {
        // Only update metadata
        await this.collection.update({
          ids: [id],
          metadatas: [metadata],
        });
      }

      this.logger.log(`Document updated with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error updating document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await this.collection.delete({
        ids: [id],
      });

      this.logger.log(`Document deleted with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete multiple documents by IDs
   */
  async deleteDocuments(ids: string[]): Promise<void> {
    try {
      await this.collection.delete({
        ids,
      });

      this.logger.log(`Deleted ${ids.length} documents`);
    } catch (error) {
      this.logger.error(`Error deleting documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionInfo(): Promise<{
    name: string;
    count: number;
    metadata: any;
  }> {
    try {
      const count = await this.collection.count();
      const collectionInfo = await this.collection.get();

      return {
        name: this.collectionName,
        count,
        metadata: collectionInfo.metadatas || [],
      };
    } catch (error) {
      this.logger.error(`Error getting collection info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clear all documents from the collection
   */
  async clearCollection(): Promise<void> {
    try {
      const allDocs = await this.getAllDocuments();
      if (allDocs.length > 0) {
        const ids = allDocs.map((doc) => doc.id);
        await this.deleteDocuments(ids);
      }
      this.logger.log('Collection cleared');
    } catch (error) {
      this.logger.error(`Error clearing collection: ${error.message}`);
      throw error;
    }
  }
}
