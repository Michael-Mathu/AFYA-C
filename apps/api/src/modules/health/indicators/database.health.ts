import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly dataSource: DataSource) {}

  async isHealthy(): Promise<boolean> {
    try {
      // ponytail: simple query to verify database connection health
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
