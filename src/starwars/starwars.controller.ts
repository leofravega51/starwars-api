import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StarwarsService } from './starwars.service';
import type { Response } from 'express';
import { starwarsFilmsToInfo } from 'src/mappers/starwarsFilmsToInfo';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@ApiTags('Films')
@Controller('starwars')
export class StarwarsController {
    constructor(private readonly starwarsService: StarwarsService) {}

    // Obtener todas las películas de la base de datos local
    @Get('films')
    @ApiOperation({ 
        summary: 'Obtener todas las películas',
        description: 'Devuelve todas las películas almacenadas en la base de datos local' 
    })
    @ApiQuery({ 
        name: 'fullinfo', 
        required: false, 
        type: Boolean,
        description: 'Incluir información completa de las películas' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de películas obtenida exitosamente',
        schema: {
            example: [
                {
                    _id: '507f1f77bcf86cd799439011',
                    title: 'A New Hope',
                    episode_id: 4,
                    opening_crawl: 'It is a period of civil war...',
                    director: 'George Lucas',
                    producer: 'Gary Kurtz',
                    release_date: '1977-05-25',
                    source: 'api',
                    isModified: false,
                    createdAt: '2024-01-01T00:00:00.000Z'
                }
            ]
        }
    })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async getFilms(
        @Query('fullinfo') fullinfo: boolean,
        @Res() res: Response
    ) {
        try {
            const films = await this.starwarsService.getFilms();
            res.status(HttpStatus.OK).send(films);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    // Obtener películas de la API externa
    @Get('films/external')
    @ApiOperation({ 
        summary: 'Obtener películas de la API externa (SWAPI)',
        description: 'Obtiene las películas directamente desde la API externa de Star Wars sin guardarlas' 
    })
    @ApiQuery({ 
        name: 'fullinfo', 
        required: false, 
        type: Boolean,
        description: 'Incluir información completa de las películas' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Películas obtenidas de la API externa exitosamente' 
    })
    @ApiResponse({ status: 500, description: 'Error al conectar con la API externa' })
    async getFilmsFromApi(
        @Query('fullinfo') fullinfo: boolean,
        @Res() res: Response
    ) {
        try {
            const films = await this.starwarsService.getFilmsFromApi();
            res.status(HttpStatus.OK).send(starwarsFilmsToInfo(films, fullinfo));
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    // Sincronizar películas de la API externa a la base de datos local
    @Post('films/sync')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Sincronizar películas desde la API externa',
        description: 'Sincroniza las películas de SWAPI con la base de datos local. Solo actualiza películas no modificadas. Requiere rol admin.' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Sincronización completada',
        schema: {
            example: {
                message: 'Sincronización completada',
                total: 6,
                success: 4,
                failed: 0,
                errors: [
                    'Película "The Empire Strikes Back" omitida: ha sido modificada localmente'
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async syncFilms(@Res() res: Response) {
        try {
            const result = await this.starwarsService.syncFilmsFromApi();
            res.status(HttpStatus.OK).send(result);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ 
                message: 'Error al sincronizar películas', 
                error: error.message 
            });
        }
    }

    // Crear película en la base de datos local
    @Post('films')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Crear nueva película',
        description: 'Crea una nueva película en la base de datos local. Requiere rol admin.' 
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Película creada exitosamente',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                title: 'A New Hope',
                episode_id: 4,
                opening_crawl: 'It is a period of civil war...',
                director: 'George Lucas',
                producer: 'Gary Kurtz',
                release_date: '1977-05-25',
                source: 'local',
                isModified: false,
                createdAt: '2024-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async createFilm(
        @Body() filmData: CreateFilmDto,
        @Res() res: Response
    ) {
        try {
            const film = await this.starwarsService.createFilm(filmData);
            res.status(HttpStatus.CREATED).send(film);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    // Obtener una película por ID de la base de datos local
    @Get('films/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('user', 'admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Obtener película por ID',
        description: 'Devuelve la información completa de una película específica. Requiere autenticación.' 
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID de la película en MongoDB',
        example: '507f1f77bcf86cd799439011' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Película encontrada exitosamente',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                title: 'A New Hope',
                episode_id: 4,
                opening_crawl: 'It is a period of civil war...',
                director: 'George Lucas',
                producer: 'Gary Kurtz',
                release_date: '1977-05-25',
                characters: [],
                planets: [],
                starships: [],
                vehicles: [],
                species: [],
                source: 'api',
                isModified: false,
                createdAt: '2024-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Película no encontrada' })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async getFilm(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            const film = await this.starwarsService.getFilm(id);
            if (!film) {
                res.status(HttpStatus.NOT_FOUND).send({ message: 'Película no encontrada' });
                return;
            }
            res.status(HttpStatus.OK).send(film);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    // Actualizar película en la base de datos local
    @Put('films/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Actualizar película',
        description: 'Actualiza la información de una película existente. Si la película es de origen API, se marca como modificada. Requiere rol admin.' 
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID de la película en MongoDB',
        example: '507f1f77bcf86cd799439011' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Película actualizada exitosamente',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                title: 'A New Hope - Special Edition',
                episode_id: 4,
                isModified: true,
                updatedAt: '2024-01-01T12:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 404, description: 'Película no encontrada' })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async updateFilm(
        @Param('id') id: string,
        @Body() filmData: UpdateFilmDto,
        @Res() res: Response
    ) {
        try {
            const film = await this.starwarsService.updateFilm(id, filmData);
            if (!film) {
                res.status(HttpStatus.NOT_FOUND).send({ message: 'Película no encontrada' });
                return;
            }
            res.status(HttpStatus.OK).send(film);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }

    // Eliminar película de la base de datos local
    @Delete('films/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Eliminar película',
        description: 'Elimina una película de la base de datos local. Requiere rol admin.' 
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID de la película en MongoDB',
        example: '507f1f77bcf86cd799439011' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Película eliminada exitosamente',
        schema: {
            example: {
                message: 'Película eliminada exitosamente',
                film: {
                    _id: '507f1f77bcf86cd799439011',
                    title: 'A New Hope'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 404, description: 'Película no encontrada' })
    @ApiResponse({ status: 500, description: 'Error del servidor' })
    async deleteFilm(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        try {
            const film = await this.starwarsService.deleteFilm(id);
            if (!film) {
                res.status(HttpStatus.NOT_FOUND).send({ message: 'Película no encontrada' });
                return;
            }
            res.status(HttpStatus.OK).send({ message: 'Película eliminada exitosamente', film });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
        }
    }
}