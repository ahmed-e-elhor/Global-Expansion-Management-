import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // console.log('Hello ',process.env.MONGO_URI)
    return 'Hello bbb  ';
  }
}
