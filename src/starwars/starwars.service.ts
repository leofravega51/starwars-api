import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { HttpClientProvider } from '../common/providers/http-client.provider';
import { EXTERNAL_API_URL } from '../shared/config';
import type { SwapiFilmResponse, SwapiApiResponse } from './interfaces';
import { Film } from './schemas/film.schema';

@Injectable()
export class StarwarsService extends HttpClientProvider {
    private readonly baseUrl: string;

    constructor(
        httpService: HttpService,
        @InjectModel(Film.name) private readonly filmModel: Model<Film>
    ) {
        super(httpService);
        this.baseUrl = EXTERNAL_API_URL || 'https://swapi.tech/api';
    }

    // Métodos para API externa
    async getFilmsFromApi() {
        const response = await this.get<SwapiApiResponse<SwapiFilmResponse[]>>(`${this.baseUrl}/films`);
        return response.result;
    }

    async getFilmFromApi(id: string) {
        const response = await this.get<SwapiApiResponse<SwapiFilmResponse>>(`${this.baseUrl}/films/${id}`);
        return response.result;
    }

    // Métodos CRUD para MongoDB
    async createFilm(filmData: Partial<Film>) {
        const newFilm = new Film({
            title: filmData.title,
            episode_id: filmData.episode_id,
            opening_crawl: filmData.opening_crawl,
            director: filmData.director,
            producer: filmData.producer,
            release_date: filmData.release_date,
            characters: filmData.characters || [],
            planets: filmData.planets || [],
            starships: filmData.starships || [],
            vehicles: filmData.vehicles || [],
            species: filmData.species || [],
            url: filmData.url,
            description: filmData.description,
            uid: filmData.uid,
            source: 'local', // Marcamos como creado localmente
            isModified: false,
        });
        
        return await this.filmModel.create(newFilm);
    }

    async getFilms() {
        return this.filmModel.find().exec();
    }

    async getFilm(id: string) {
        return this.filmModel.findById(id).exec();
    }

    async updateFilm(id: string, filmData: Partial<Film>) {
        const film = await this.filmModel.findById(id);
        
        // Si la película viene de la API, marcarla como modificada
        if (film && film.source === 'api') {
            filmData.isModified = true;
        }
        
        return this.filmModel.findByIdAndUpdate(id, filmData, { new: true }).exec();
    }

    async deleteFilm(id: string) {
        return this.filmModel.findByIdAndDelete(id).exec();
    }

    async syncFilmsFromApi() {
        try {
            const externalFilms = await this.getFilmsFromApi();
            
            const syncResults = {
                success: 0,
                failed: 0,
                errors: [] as string[]
            };

            // Procesar cada película
            for (const externalFilm of externalFilms) {
                try {
                    // Buscar si ya existe por uid
                    const existingFilm = await this.filmModel.findOne({ uid: externalFilm.uid });

                    // Mapear datos de la API externa a nuestro schema
                    const filmData = {
                        title: externalFilm.properties.title,
                        episode_id: externalFilm.properties.episode_id,
                        opening_crawl: externalFilm.properties.opening_crawl,
                        director: externalFilm.properties.director,
                        producer: externalFilm.properties.producer,
                        release_date: externalFilm.properties.release_date,
                        characters: externalFilm.properties.characters || [],
                        planets: externalFilm.properties.planets || [],
                        starships: externalFilm.properties.starships || [],
                        vehicles: externalFilm.properties.vehicles || [],
                        species: externalFilm.properties.species || [],
                        url: externalFilm.properties.url,
                        description: externalFilm.description,
                        uid: externalFilm.uid,
                        source: 'api' as const,
                        lastSyncDate: new Date(),
                    };

                    if (existingFilm) {
                        // Solo actualizar si NO ha sido modificado localmente
                        if (!existingFilm.isModified) {
                            await this.filmModel.findByIdAndUpdate(existingFilm._id, filmData, { new: true });
                            syncResults.success++;
                        } else {
                            // Registrar como omitido porque fue modificado
                            syncResults.errors.push(`Película "${externalFilm.properties.title}" omitida: ha sido modificada localmente`);
                        }
                    } else {
                        // Crear nuevo si no existe (validación del constructor se aplica aquí)
                        const newFilm = new Film(filmData);
                        await this.filmModel.create(newFilm);
                        syncResults.success++;
                    }
                } catch (error) {
                    syncResults.failed++;
                    syncResults.errors.push(`Error con película ${externalFilm.uid}: ${error.message}`);
                }
            }

            return {
                message: 'Sincronización completada',
                total: externalFilms.length,
                ...syncResults
            };
        } catch (error) {
            throw new Error(`Error al sincronizar películas: ${error.message}`);
        }
    }
}