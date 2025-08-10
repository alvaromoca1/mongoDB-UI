import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

type Session = { id: string; client: MongoClient; lastAccess: number };

@Injectable()
export class SessionsService {
  private static sessions = new Map<string, Session>();

  // SOLID: responsabilidad única: gestionar sesiones de Mongo
  add(id: string, client: MongoClient) {
    SessionsService.sessions.set(id, { id, client, lastAccess: Date.now() });
  }
  get(id: string) {
    const s = SessionsService.sessions.get(id);
    if (s) s.lastAccess = Date.now();
    return s?.client ?? null;
  }
  async close(id: string) {
    const s = SessionsService.sessions.get(id);
    if (!s) return false;
    await s.client.close();
    SessionsService.sessions.delete(id);
    return true;
  }
}


