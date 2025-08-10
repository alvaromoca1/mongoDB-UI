import { Body, Controller, Delete, Get, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ConnService } from './conn.service';

@Controller('api')
export class ConnController {
  constructor(private readonly svc: ConnService) {}

  @Post('connections/test')
  test(@Body() body: any) {
    return this.svc.test(body);
  }

  @Post('connections')
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get('connections')
  list() {
    return this.svc.list();
  }

  @Delete('connections/:id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post('connect/:id/open')
  async open(@Param('id') id: string) {
    try {
      console.log(`Intentando abrir conexión con ID: ${id}`);
      const result = await this.svc.open(id);
      console.log(`Conexión abierta exitosamente: ${result.sessionId}`);
      return result;
    } catch (error: any) {
      console.error(`Error al abrir conexión ${id}:`, error);
      
      // Determinar el código de estado apropiado
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      if (error.statusCode) {
        statusCode = error.statusCode;
      } else if (error.message?.includes('no encontrado')) {
        statusCode = HttpStatus.NOT_FOUND;
      } else if (error.message?.includes('URI')) {
        statusCode = HttpStatus.BAD_REQUEST;
      } else if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
        statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      }
      
      throw new HttpException({
        statusCode,
        message: error.message || 'Error interno del servidor',
        error: 'Connection Error'
      }, statusCode);
    }
  }
}


