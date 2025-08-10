import { Body, Controller, Param, Post } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Controller('api')
export class AggregateController {
  constructor(private readonly sessions: SessionsService) {}

  @Post(':sessionId/aggregate')
  async aggregate(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cursor = client.db(body.db).collection(body.coll).aggregate(body.pipeline ?? [], { allowDiskUse: body.allowDiskUse });
    const docs = await cursor.toArray();
    return { docs };
  }

  @Post(':sessionId/explain')
  async explain(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const coll = client.db(body.db).collection(body.coll);
    if (body.pipeline) return { explain: await coll.aggregate(body.pipeline).explain() };
    return { explain: await coll.find(body.filter ?? {}).explain() };
  }
}


