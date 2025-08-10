import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { FastifyReply } from 'fastify';

@Controller('api')
export class StreamController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':sessionId/changes/stream')
  async stream(@Param('sessionId') sessionId: string, @Query('db') db: string, @Query('coll') coll: string, @Res() reply: FastifyReply) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    const changeStream = client.db(db).collection(coll).watch([], { fullDocument: 'updateLookup' });
    reply.raw.write(`data: ${JSON.stringify({ type: 'ready' })}\n\n`);
    changeStream.on('change', (change) => reply.raw.write(`data: ${JSON.stringify({ type: 'change', change })}\n\n`));
    changeStream.on('error', (err) => reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
    reply.raw.on('close', () => changeStream.close().catch(() => {}));
  }
}


