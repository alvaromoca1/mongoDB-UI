import { MongoClient, type Db, type Document } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { env } from '../lib/config.js';
import { createTunnel, SshTunnel } from '../ssh/tunnel.js';

type Session = {
  id: string;
  client: MongoClient;
  lastAccess: number;
  tunnel?: SshTunnel | null;
};

const INACTIVITY_MS = 1000 * 60 * 15; // 15m

export class ConnectionManager {
  private sessions = new Map<string, Session>();

  constructor() {
    setInterval(() => this.cleanup(), 60_000);
  }

  async open(connectionUri: string, sshConfig?: any) {
    let tunnel: SshTunnel | null = null;
    let uri = connectionUri;
    if (sshConfig && env.SSH_ENABLED === 'true') {
      tunnel = await createTunnel(sshConfig);
      uri = uri.replace('localhost', '127.0.0.1');
      // Ajuste de puerto si URI sin puerto (para SRV no aplica). Para simplicity, si no especificado, dejamos URI tal cual.
    }

    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
    const id = randomUUID();
    const session: Session = { id, client, lastAccess: Date.now(), tunnel };
    this.sessions.set(id, session);
    return id;
  }

  get(sessionId: string) {
    const s = this.sessions.get(sessionId);
    if (!s) return null;
    s.lastAccess = Date.now();
    return s.client;
  }

  async close(sessionId: string) {
    const s = this.sessions.get(sessionId);
    if (!s) return false;
    await s.client.close();
    if (s.tunnel) await s.tunnel.close();
    this.sessions.delete(sessionId);
    return true;
  }

  private async cleanup() {
    const now = Date.now();
    for (const [id, s] of this.sessions.entries()) {
      if (now - s.lastAccess > INACTIVITY_MS) {
        await s.client.close();
        if (s.tunnel) await s.tunnel.close();
        this.sessions.delete(id);
      }
    }
  }
}

export const connectionManager = new ConnectionManager();


