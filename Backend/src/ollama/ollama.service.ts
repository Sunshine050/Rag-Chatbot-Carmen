import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
  }

  async generateResponse(model: string, prompt: string) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model,
        prompt,
        stream: false,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling Ollama API: ${error.message}`);
      throw error;
    }
  }

  async generateEmbedding(model: string, prompt: string) {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
        model,
        prompt,
      });
      return response.data.embedding;
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw error;
    }
  }
}
