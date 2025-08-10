import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { SessionsService } from '../sessions/sessions.service';

const DATA_DIR = process.env.DATA_DIR || '/data';
const FILE = path.join(DATA_DIR, 'connections.json');

@Injectable()
export class ConnService {
  constructor(private readonly sessions: SessionsService) {}
  private async ensureFile() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(FILE);
    } catch {
      await fs.writeFile(FILE, '[]', 'utf8');
    }
  }

  async test(_body: any) {
    return { ok: true };
  }

  async create(body: any) {
    await this.ensureFile();
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as any[];
    const item = { id: randomUUID(), name: body.name, createdAt: Date.now(), data: body };
    list.push(item);
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf8');
    return { id: item.id, name: item.name, createdAt: item.createdAt };
  }

  async list() {
    await this.ensureFile();
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as any[];
    return list.map((c) => ({ id: c.id, name: c.name, createdAt: c.createdAt }));
  }

  async remove(id: string) {
    await this.ensureFile();
    const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as any[];
    const next = list.filter((c) => c.id !== id);
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), 'utf8');
    return { ok: true };
  }

  async open(_id: string) {
    try {
      await this.ensureFile();
      const list = JSON.parse(await fs.readFile(FILE, 'utf8')) as any[];
      const item = list.find((c) => c.id === _id);
      if (!item) {
        const error = new Error('Perfil no encontrado');
        (error as any).statusCode = 404;
        throw error;
      }
      
      const uri: string = item.data?.uri || item.data?.connectionString || item.data?.url;
      if (!uri) {
        const error = new Error('URI no definido en el perfil');
        (error as any).statusCode = 400;
        throw error;
      }
      
      console.log(`Intentando conectar a MongoDB con URI: ${uri}`);
      const client = new MongoClient(uri, { 
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000
      });
      
      await client.connect();
      console.log('Conexión exitosa a MongoDB');
      
      // Verificar que la conexión funciona
      await client.db().admin().ping();
      console.log('Ping exitoso a MongoDB');
      
      const sessionId = randomUUID();
      this.sessions.add(sessionId, client);
      console.log(`Sesión creada: ${sessionId}`);
      
      return { sessionId };
    } catch (error) {
      console.error('Error al abrir conexión:', error);
      if (error instanceof Error) {
        (error as any).statusCode = 500;
      }
      throw error;
    }
  }
}


