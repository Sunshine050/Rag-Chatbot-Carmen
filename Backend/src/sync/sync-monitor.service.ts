import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SyncStatus {
  timestamp: number;
  gitSync: {
    latestCommit: {
      sha: string;
      message: string;
      author: string;
      date: string;
    } | null;
    timeSinceCommit: {
      minutes: number;
      seconds: number;
    } | null;
    isNewCommit: boolean;
    status: 'success' | 'failed' | 'unknown';
  };
  chromaDBSync: {
    status: 'synced' | 'pending' | 'failed' | 'unknown';
    lastSyncTime: string | null;
    note: string;
  };
}

@Injectable()
export class SyncMonitorService {
  private readonly logger = new Logger(SyncMonitorService.name);
  private syncHistory: SyncStatus[] = [];
  private readonly GITHUB_REPO = 'Sunshine050/Rag-Chatbot-Carmen';
  private readonly GITHUB_API = `https://api.github.com/repos/${this.GITHUB_REPO}`;
  private readonly CHROMADB_COLLECTION = 'sunshine050_rag_chatbot_carmen_main';
  private lastCommitSha: string | null = null;

  constructor(private configService: ConfigService) {
    // Start monitoring every 30 seconds
    this.startMonitoring();
  }

  /**
   * Start monitoring sync status
   */
  private startMonitoring() {
    this.logger.log('🔄 Starting sync monitoring...');
    
    // Initial check
    this.checkSyncStatus();

    // Check every 30 seconds
    setInterval(() => {
      this.checkSyncStatus();
    }, 30000); // 30 seconds
  }

  /**
   * Check sync status from GitHub and ChromaDB
   */
  async checkSyncStatus(): Promise<SyncStatus> {
    const timestamp = Date.now();
    const status: SyncStatus = {
      timestamp,
      gitSync: {
        latestCommit: null,
        timeSinceCommit: null,
        isNewCommit: false,
        status: 'unknown',
      },
      chromaDBSync: {
        status: 'unknown',
        lastSyncTime: null,
        note: 'ChromaDB sync status requires manual check in dashboard',
      },
    };

    try {
      // Check GitHub (Wiki.js → Git)
      const latestCommit = await this.getLatestCommit();
      
      if (latestCommit) {
        status.gitSync.latestCommit = latestCommit;
        
        const commitTime = new Date(latestCommit.date).getTime();
        const timeDiff = timestamp - commitTime;
        status.gitSync.timeSinceCommit = {
          minutes: Math.floor(timeDiff / 60000),
          seconds: Math.floor((timeDiff % 60000) / 1000),
        };

        // Check if this is a new commit
        if (this.lastCommitSha !== latestCommit.sha) {
          status.gitSync.isNewCommit = true;
          this.lastCommitSha = latestCommit.sha;
          this.logger.log(
            `🆕 New commit detected: ${latestCommit.message} (${latestCommit.sha.substring(0, 7)})`,
          );
        } else {
          status.gitSync.isNewCommit = false;
        }

        status.gitSync.status = 'success';
      } else {
        status.gitSync.status = 'failed';
        this.logger.warn('⚠️  Could not fetch GitHub commits');
      }
    } catch (error) {
      status.gitSync.status = 'failed';
      this.logger.error(`❌ Error checking GitHub sync: ${error.message}`);
    }

    // ChromaDB sync status (manual check required)
    // Note: ChromaDB doesn't provide public API for sync status
    // Users need to check manually in dashboard
    status.chromaDBSync.status = 'unknown';
    status.chromaDBSync.note = `Check ChromaDB Dashboard: https://cloud.trychroma.com/sync\nCollection: ${this.CHROMADB_COLLECTION}`;

    // Save to history (keep last 100 entries)
    this.syncHistory.push(status);
    if (this.syncHistory.length > 100) {
      this.syncHistory.shift();
    }

    // Log summary
    this.logSyncSummary(status);

    return status;
  }

  /**
   * Get latest commit from GitHub
   */
  private async getLatestCommit() {
    try {
      const response = await axios.get(`${this.GITHUB_API}/commits`, {
        params: {
          per_page: 1,
        },
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.data && response.data.length > 0) {
        const commit = response.data[0];
        return {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
        };
      }
      return null;
    } catch (error) {
      this.logger.error(`Error fetching GitHub commits: ${error.message}`);
      return null;
    }
  }

  /**
   * Log sync summary
   */
  private logSyncSummary(status: SyncStatus) {
    if (status.gitSync.latestCommit) {
      const commit = status.gitSync.latestCommit;
      const timeSince = status.gitSync.timeSinceCommit;
      
      this.logger.log(
        `📊 Sync Status: Commit "${commit.message}" (${commit.sha.substring(0, 7)}) - ${timeSince.minutes}m ${timeSince.seconds}s ago`,
      );

      if (status.gitSync.isNewCommit) {
        this.logger.log(`🆕 New commit detected! ChromaDB should sync within 5-30 minutes.`);
      }
    }
  }

  /**
   * Get current sync status
   */
  async getCurrentStatus(): Promise<SyncStatus> {
    return this.checkSyncStatus();
  }

  /**
   * Get sync history
   */
  getSyncHistory(): SyncStatus[] {
    return this.syncHistory;
  }

  /**
   * Get sync history (last N entries)
   */
  getSyncHistoryLast(n: number = 10): SyncStatus[] {
    return this.syncHistory.slice(-n);
  }
}
