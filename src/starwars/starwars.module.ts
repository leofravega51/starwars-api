import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { StarwarsController } from './starwars.controller';
import { StarwarsService } from './starwars.service';
import { RolesGuard } from '../common/roles.guard';
import { Film, FilmSchema } from './schemas/film.schema';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }])
    ],
    controllers: [StarwarsController],
    providers: [StarwarsService, RolesGuard],
    exports: [StarwarsService]
})
export class StarwarsModule {}