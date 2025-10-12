import { SwapiFilmResponse } from "src/starwars/interfaces";

export const starwarsFilmsToInfo = (films: SwapiFilmResponse[], fullinfo?: boolean) => {
    if (fullinfo) return films.map(film => {
        return ({
            ...film.properties,
            description: film.description,
            uid: film.uid,
            _id: film._id
        })
    });
    return films.map(film => ({
        id: film._id,
        uid: film.uid,
        title: film.properties.title,
        director: film.properties.director,
        producer: film.properties.producer,
        opening_crawl: film.properties.opening_crawl,
        episode_id: film.properties.episode_id,
        release_date: film.properties.release_date,
    }));
}