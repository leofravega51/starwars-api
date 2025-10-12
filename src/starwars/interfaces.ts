export interface FilmProperties {
    created: string; // Fecha y hora en formato ISO 8601
    edited: string; // Fecha y hora en formato ISO 8601

    // Arrays de URLs de recursos relacionados (Starships, Vehicles, Planets, etc.)
    starships: string[];
    vehicles: string[];
    planets: string[];
    characters: string[];
    species: string[];

    producer: string;
    title: string;
    director: string;
    release_date: string; // Fecha en formato ISO (YYYY-MM-DD)
    opening_crawl: string;
    url: string;

    // Propiedad numérica
    episode_id: number;
}

export interface SwapiFilmResponse {
    properties: FilmProperties;
    _id: string;
    description: string;
    uid: string;
    __v: number;
}

export interface SwapiApiResponse<T> {
    message: string;
    result: T;
}