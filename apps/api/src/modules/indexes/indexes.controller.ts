import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Controller('api')
export class IndexesController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':sessionId/indexes')
  async list(@Param('sessionId') sessionId: string, @Query('db') db: string, @Query('coll') coll: string) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    return client.db(db).collection(coll).indexes();
  }

  @Post(':sessionId/indexes')
  async create(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const name = await client.db(body.db).collection(body.coll).createIndex(body.keys, body.options);
    return { name };
  }

  @Delete(':sessionId/indexes')
  async drop(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(body.db).collection(body.coll).dropIndex(body.name);
    return { ok: true };
  }
}


