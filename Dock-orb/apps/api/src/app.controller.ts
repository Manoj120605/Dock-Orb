import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      name: 'Capsule AI API',
      status: 'ok',
      docs: '/docs',
      apiPrefix: '/api/v1',
    };
  }
}
