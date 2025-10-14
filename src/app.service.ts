import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Api de StarWars. Accede a la documentación en /api/docs';
  }
}
