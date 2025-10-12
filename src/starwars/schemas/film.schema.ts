import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from 'src/shared/interfaces';

@Schema({ timestamps: true })
export class Film extends Base {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    episode_id: number;

    @Prop({ required: true })
    opening_crawl: string;

    @Prop({ required: true })
    director: string;

    @Prop({ required: true })
    producer: string;

    @Prop({ required: true })
    release_date: string;

    @Prop({ type: [String], default: [] })
    characters: string[];

    @Prop({ type: [String], default: [] })
    planets: string[];

    @Prop({ type: [String], default: [] })
    starships: string[];

    @Prop({ type: [String], default: [] })
    vehicles: string[];

    @Prop({ type: [String], default: [] })
    species: string[];

    @Prop()
    url: string;

    @Prop()
    description: string;

    @Prop()
    uid: string;

    // Control de origen y modificaciones
    @Prop({ type: String, enum: ['api', 'local'], default: 'local' })
    source: 'api' | 'local'; // Indica si viene de la API externa o fue creado localmente

    @Prop({ type: Boolean, default: false })
    isModified: boolean; // Indica si un registro de la API ha sido modificado manualmente

    @Prop({ type: Date })
    lastSyncDate?: Date; // Fecha de la última sincronización con la API

    constructor(partial?: Partial<Film>) {
        super();
        
        if (!partial) {
            throw new Error('No se proporcionaron datos para crear la película');
        }
        
        // Validar campos requeridos
        const requiredFields: Array<keyof Film> = ['title', 'episode_id', 'opening_crawl', 'director', 'producer', 'release_date'];
        const missingFields = requiredFields.filter(field => {
            const value = partial[field];
            return value === undefined || value === null || value === '';
        });
        
        if (missingFields.length > 0) {
            throw new Error(`Faltan los siguientes campos requeridos: ${missingFields.join(', ')}`);
        }
        
        // Validar tipos de datos
        if (typeof partial.title !== 'string') {
            throw new Error('El campo "title" debe ser una cadena de texto');
        }
        
        if (typeof partial.episode_id !== 'number') {
            throw new Error('El campo "episode_id" debe ser un número');
        }
        
        if (typeof partial.opening_crawl !== 'string') {
            throw new Error('El campo "opening_crawl" debe ser una cadena de texto');
        }
        
        if (typeof partial.director !== 'string') {
            throw new Error('El campo "director" debe ser una cadena de texto');
        }
        
        if (typeof partial.producer !== 'string') {
            throw new Error('El campo "producer" debe ser una cadena de texto');
        }
        
        if (typeof partial.release_date !== 'string') {
            throw new Error('El campo "release_date" debe ser una cadena de texto');
        }
        
        // Validar arrays opcionales si están presentes
        const arrayFields: Array<keyof Film> = ['characters', 'planets', 'starships', 'vehicles', 'species'];
        arrayFields.forEach(field => {
            if (partial[field] !== undefined && !Array.isArray(partial[field])) {
                throw new Error(`El campo "${field}" debe ser un array`);
            }
        });
        
        Object.assign(this, partial);
    }
}

export const FilmSchema = SchemaFactory.createForClass(Film);

