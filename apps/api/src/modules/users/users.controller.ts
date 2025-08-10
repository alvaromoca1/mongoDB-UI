import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';

@Controller('api')
export class UsersController {
  constructor(private readonly sessions: SessionsService) {}

  @Get(':sessionId/users')
  async list(@Param('sessionId') sessionId: string, @Query('db') db: string) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    return (await client.db(db).command({ usersInfo: 1, showCredentials: false, showPrivileges: true })).users;
  }

  @Post(':sessionId/users')
  async create(@Param('sessionId') sessionId: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    return client.db(body.db).command({ createUser: body.username, pwd: body.password, roles: body.roles ?? [] });
  }

  @Patch(':sessionId/users/:username')
  async patch(@Param('sessionId') sessionId: string, @Param('username') username: string, @Body() body: any) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    const cmd: any = { updateUser: username };
    if (body.password) cmd.pwd = body.password;
    if (body.roles) cmd.roles = body.roles;
    return client.db(body.db).command(cmd);
  }

  @Delete(':sessionId/users/:username')
  async remove(@Param('sessionId') sessionId: string, @Param('username') username: string, @Query('db') db: string) {
    const client = this.sessions.get(sessionId);
    if (!client) throw new Error('Sesión no encontrada');
    await client.db(db).command({ dropUser: username });
    return { ok: true };
  }
}


