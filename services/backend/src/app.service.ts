import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Carbon Footprint Tracker API v1.0';
  }
}