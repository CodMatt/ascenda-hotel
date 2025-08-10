import { emailService } from './emailService';
import logger from 'jet-logger';

/******************************************************************************
 Cleanup Service Class
******************************************************************************/

export class CleanupService {
  
  /**
   * Run all cleanup tasks
   */
  static async runCleanupTasks(): Promise<void> {
    logger.info('🧹 Starting cleanup tasks...');
    
    try {
      // Cleanup expired email access tokens
      const expiredTokens = await emailService.cleanupExpiredTokens();
      logger.info(`✅ Cleaned up ${expiredTokens} expired email access tokens`);
      logger.info('🎉 Cleanup tasks completed successfully');
      
    } catch (error) {
      logger.err('❌ Cleanup tasks failed:', error);
    }
  }
  
  /**
   * Start periodic cleanup (run every hour)
   */
  static startPeriodicCleanup(): void {
    // Run cleanup immediately
    this.runCleanupTasks();
    
    // Then run every hour (3600000 ms)
    setInterval(() => {
      this.runCleanupTasks();
    }, 3600000); // 1 hour
    
    logger.info('🔄 Periodic cleanup service started (runs every hour)');
  }
  
  /**
   * Manual cleanup trigger (for testing or manual execution)
   */
  static async manualCleanup(): Promise<{ expiredTokens: number; success: boolean }> {
    try {
      const expiredTokens = await emailService.cleanupExpiredTokens();
      return { expiredTokens, success: true };
    } catch (error) {
      logger.err('Manual cleanup failed:', error);
      return { expiredTokens: 0, success: false };
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
export default CleanupService;