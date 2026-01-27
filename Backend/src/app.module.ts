import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { OllamaService } from './ollama/ollama.service';
import { RagService } from './rag/rag.service';
import { ChromaDBService } from './chromadb/chromadb.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [OllamaService, ChromaDBService, RagService],
})
export class AppModule {}
