import { Body, Controller, Param, Post } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Controller('api')
export class CrudController {
  constructor(private readonly sessions: SessionsService) {}

  @Post(':sessionId/insertOne')
  async insertOne(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    const res = await client.db(body.db).collection(body.coll).insertOne(body.doc);
    return { insertedId: res.insertedId };
  }

  @Post(':sessionId/updateOne')
  async updateOne(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    const res = await client.db(body.db).collection(body.coll).updateOne(body.filter, body.update, body.options ?? {});
    return { matchedCount: res.matchedCount, modifiedCount: res.modifiedCount, upsertedId: res.upsertedId };
  }

  @Post(':sessionId/deleteOne')
  async deleteOne(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) {
      const error = new Error('Sesión no encontrada');
      (error as any).statusCode = 404;
      throw error;
    }
    const res = await client.db(body.db).collection(body.coll).deleteOne(body.filter);
    return { deletedCount: res.deletedCount };
  }
}


