import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { OllamaService } from './ollama/ollama.service';
import { RagService } from './rag/rag.service';
import { ChromaDBService } from './chromadb/chromadb.service';
import { SyncMonitorService } from './sync/sync-monitor.service';
import { SyncMonitorController } from './sync/sync-monitor.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, SyncMonitorController],
  providers: [OllamaService, ChromaDBService, RagService, SyncMonitorService],
})
export class AppModule {}
