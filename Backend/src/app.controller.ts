import { Controller, Post, Body, Get } from '@nestjs/common';
import { RagService } from './rag/rag.service';

@Controller('api')
export class AppController {
  constructor(private readonly ragService: RagService) {}

  @Post('chat')
  async chat(@Body() body: { query: string; topK?: number }) {
    return await this.ragService.chat(body.query, body.topK);
  }

  @Post('documents')
  async addDocument(
    @Body()
    body: {
      id: string;
      content: string;
      metadata?: { source?: string; title?: string; [key: string]: any };
    },
  ) {
    return await this.ragService.addDocument(
      body.id,
      body.content,
      body.metadata,
    );
  }

  @Get('documents/info')
  async getCollectionInfo() {
    return await this.ragService.getCollectionInfo();
  }
}
