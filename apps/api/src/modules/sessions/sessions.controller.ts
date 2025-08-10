import { Controller, Param, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('api')
export class SessionsController {
  constructor(private readonly svc: SessionsService) {}

  @Post('connect/:sessionId/close')
  async close(@Param('sessionId') sessionId: string) {
    const ok = await this.svc.close(sessionId);
    return { ok };
  }
}


