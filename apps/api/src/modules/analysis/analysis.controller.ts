import { Controller, Get, Param, Query } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

function walk(doc: any, prefix: string, out: Map<string, Record<string, number>>) {
  if (doc === null) {
    const key = prefix || '$root';
    out.set(key, { ...(out.get(key) || {}), null: (out.get(key)?.null || 0) + 1 });
    return;
  }
  const t = Array.isArray(doc) ? 'array' : typeof doc;
  const key = prefix || '$root';
  const map = out.get(key) || {};
  map[t] = (map[t] || 0) + 1;
  out.set(key, map);
  if (t === 'object' && !Array.isArray(doc)) {
    for (const [k, v] of Object.entries(doc)) walk(v as any, prefix ? `${prefix}.${k}` : String(k), out);
  }
  if (Array.isArray(doc)) for (const v of doc) walk(v, `${prefix}[]`, out);
}

@Controller('api')
export class AnalysisController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':sessionId/schema')
  async schema(@Param('sessionId') sessionId: string, @Query('db') db: string, @Query('coll') coll: string) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const sample = await client.db(db).collection(coll).aggregate([{ $sample: { size: 200 } }]).toArray();
    const out = new Map<string, Record<string, number>>();
    for (const d of sample) walk(d, '', out);
    return Array.from(out.entries()).map(([path, types]) => ({ path, types }));
  }

  @Get(':sessionId/stats')
  async stats(@Param('sessionId') sessionId: string, @Query('db') db: string, @Query('coll') coll?: string) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    if (coll) return client.db(db).command({ collStats: coll });
    return client.db(db).stats();
  }
}


