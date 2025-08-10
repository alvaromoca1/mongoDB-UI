import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Controller('api')
export class ExplorerController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':sessionId/databases')
  async databases(@Param('sessionId') sessionId: string) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    const list = await client.db().admin().listDatabases({ nameOnly: false });
    return list.databases;
  }

  @Get(':sessionId/databases/:db/collections')
  async collections(@Param('sessionId') sessionId: string, @Param('db') db: string) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    return client.db(db).listCollections().toArray();
  }

  @Post(':sessionId/find')
  async find(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    const cursor = client
      .db(body.db)
      .collection(body.coll)
      .find(body.filter ?? {}, { projection: body.projection, sort: body.sort, skip: body.skip ?? 0, limit: Math.min(body.limit ?? 50, 500) });
    return { docs: await cursor.toArray() };
  }
}


