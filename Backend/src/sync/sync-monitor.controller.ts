import { Controller, Get, Query } from '@nestjs/common';
import { SyncMonitorService, SyncStatus } from './sync-monitor.service';

@Controller('api/sync')
export class SyncMonitorController {
  constructor(private readonly syncMonitorService: SyncMonitorService) {}

  @Get('status')
  async getStatus(): Promise<SyncStatus> {
    return await this.syncMonitorService.getCurrentStatus();
  }

  @Get('history')
  getHistory(@Query('limit') limit?: string): SyncStatus[] {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.syncMonitorService.getSyncHistoryLast(limitNum);
  }

  @Get('logs')
  getAllLogs(): SyncStatus[] {
    return this.syncMonitorService.getSyncHistory();
  }
}
