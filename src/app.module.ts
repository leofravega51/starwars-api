import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN } from './shared/config';
import { UsersModule } from './users/users.module';
import { StarwarsModule } from './starwars/starwars.module';
import { JwtStrategy } from './common/localstrategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI || ''),
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: JWT_EXPIRES_IN as any || '24h' },
    }),
    UsersModule,
    StarwarsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
