import { Body, Controller, Post, Param, Req } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { Readable } from 'stream';
import type { FastifyRequest } from 'fastify';

@Controller('api')
export class TransferController {
  constructor(private readonly sessions: SessionsService) {}

  @Post(':sessionId/export')
  async export(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cursor = client.db(body.db).collection(body.coll).find(body.filter ?? {});
    const stream = Readable.from((async function* () {
      for await (const doc of cursor) yield JSON.stringify(doc) + '\n';
    })());
    return stream as any;
  }

  @Post(':sessionId/import')
  async import(@Param('sessionId') sessionId: string, @Req() req: FastifyRequest, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const db = body.db; const coll = body.coll; const preview = body.preview === 'true';
    const file = await (req as any).file();
    if (!file) throw new Error('Fichero requerido');
    const chunks: Buffer[] = [];
    for await (const chunk of file.file) chunks.push(chunk);
    const text = Buffer.concat(chunks).toString('utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (preview) {
      return { preview: lines.slice(0, 20).map((l) => JSON.parse(l)) };
    }
    const batch: any[] = [];
    for (const l of lines) {
      batch.push(JSON.parse(l));
      if (batch.length >= 1000) { await client.db(db).collection(coll).insertMany(batch); batch.length = 0; }
    }
    if (batch.length) await client.db(db).collection(coll).insertMany(batch);
    return { ok: true };
  }
}


