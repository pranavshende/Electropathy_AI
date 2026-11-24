/**
 * Electropathy AI - Database Circuit Breaker & Connection Health Tracker
 * Prevents consecutive 5s TCP timeouts when the remote database or pooler is unreachable.
 */

class DatabaseCircuitBreaker {
  private isAvailable = true;
  private lastFailureTime = 0;
  private readonly cooldownMs = 60_000; // 60s cooldown before attempting to probe database again

  /**
   * Check if database calls should be attempted
   */
  public isDbAvailable(): boolean {
    if (this.isAvailable) {
      return true;
    }

    // Cooldown window elapsed: allow a single probe to check if database has recovered
    if (Date.now() - this.lastFailureTime > this.cooldownMs) {
      return true;
    }

    return false;
  }

  /**
   * Record a database error. If it's a connection/pooler/DNS error, trip the circuit breaker.
   */
  public recordError(error: any): void {
    const msg = String(error?.message || error || '');
    const code = error?.code || '';

    const isConnectionError = 
      code === 'XX000' || 
      code === 'P1001' || 
      code === 'P1002' ||
      msg.includes('ENOTFOUND') || 
      msg.includes('tenant/user') || 
      msg.includes('ETIMEDOUT') || 
      msg.includes('ECONNREFUSED') ||
      msg.includes('Can\'t reach database server');

    if (isConnectionError) {
      this.isAvailable = false;
      this.lastFailureTime = Date.now();
    }
  }

  /**
   * Record a successful database call
   */
  public recordSuccess(): void {
    this.isAvailable = true;
  }
}

export const dbCircuitBreaker = new DatabaseCircuitBreaker();
