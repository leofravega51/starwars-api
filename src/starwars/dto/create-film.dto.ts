import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateFilmDto {
    @ApiProperty({
        description: 'Título de la película',
        example: 'A New Hope',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Número de episodio',
        example: 4,
        minimum: 1,
    })
    @IsNumber()
    episode_id: number;

    @ApiProperty({
        description: 'Texto de introducción de la película',
        example: 'It is a period of civil war. Rebel spaceships...',
    })
    @IsString()
    opening_crawl: string;

    @ApiProperty({
        description: 'Director de la película',
        example: 'George Lucas',
    })
    @IsString()
    director: string;

    @ApiProperty({
        description: 'Productor(es) de la película',
        example: 'Gary Kurtz, Rick McCallum',
    })
    @IsString()
    producer: string;

    @ApiProperty({
        description: 'Fecha de estreno (formato: YYYY-MM-DD)',
        example: '1977-05-25',
    })
    @IsString()
    release_date: string;

    @ApiPropertyOptional({
        description: 'URLs de los personajes que aparecen en la película',
        type: [String],
        example: ['http://swapi.dev/api/people/1/', 'http://swapi.dev/api/people/2/'],
    })
    @IsArray()
    @IsOptional()
    characters?: string[];

    @ApiPropertyOptional({
        description: 'URLs de los planetas que aparecen en la película',
        type: [String],
        example: ['http://swapi.dev/api/planets/1/'],
    })
    @IsArray()
    @IsOptional()
    planets?: string[];

    @ApiPropertyOptional({
        description: 'URLs de las naves espaciales que aparecen en la película',
        type: [String],
        example: ['http://swapi.dev/api/starships/2/'],
    })
    @IsArray()
    @IsOptional()
    starships?: string[];

    @ApiPropertyOptional({
        description: 'URLs de los vehículos que aparecen en la película',
        type: [String],
        example: ['http://swapi.dev/api/vehicles/4/'],
    })
    @IsArray()
    @IsOptional()
    vehicles?: string[];

    @ApiPropertyOptional({
        description: 'URLs de las especies que aparecen en la película',
        type: [String],
        example: ['http://swapi.dev/api/species/1/'],
    })
    @IsArray()
    @IsOptional()
    species?: string[];

    @ApiPropertyOptional({
        description: 'URL del recurso en la API externa',
        example: 'http://swapi.dev/api/films/1/',
    })
    @IsString()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({
        description: 'Descripción adicional de la película',
        example: 'La primera película de la saga original de Star Wars',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'Identificador único de la API externa',
        example: '1',
    })
    @IsString()
    @IsOptional()
    uid?: string;
}

