import { Test, TestingModule } from '@nestjs/testing';
import { StarwarsController } from './starwars.controller';
import { StarwarsService } from './starwars.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

describe('StarwarsController', () => {
  let controller: StarwarsController;
  let service: StarwarsService;

  const mockFilm = {
    _id: '507f1f77bcf86cd799439011',
    title: 'A New Hope',
    episode_id: 4,
    opening_crawl: 'It is a period of civil war...',
    director: 'George Lucas',
    producer: 'Gary Kurtz',
    release_date: '1977-05-25',
    characters: ['http://swapi.tech/api/people/1'],
    planets: ['http://swapi.tech/api/planets/1'],
    starships: ['http://swapi.tech/api/starships/2'],
    vehicles: ['http://swapi.tech/api/vehicles/4'],
    species: ['http://swapi.tech/api/species/1'],
    url: 'http://swapi.tech/api/films/1',
    description: 'Primera película de Star Wars',
    uid: '1',
    source: 'api' as const,
    isModified: false,
    lastSyncDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExternalFilms = [
    {
      properties: {
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
        url: 'http://swapi.tech/api/films/1',
      },
      description: 'Primera película de Star Wars',
      uid: '1',
    },
  ];

  const mockStarwarsService = {
    getFilms: jest.fn(),
    getFilmsFromApi: jest.fn(),
    getFilm: jest.fn(),
    createFilm: jest.fn(),
    updateFilm: jest.fn(),
    deleteFilm: jest.fn(),
    syncFilmsFromApi: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarwarsController],
      providers: [
        {
          provide: StarwarsService,
          useValue: mockStarwarsService,
        },
      ],
    }).compile();

    controller = module.get<StarwarsController>(StarwarsController);
    service = module.get<StarwarsService>(StarwarsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFilms', () => {
    it('should return all films from database', async () => {
      const res = mockResponse();
      const films = [mockFilm, { ...mockFilm, _id: 'another-id' }];

      mockStarwarsService.getFilms.mockResolvedValue(films);

      await controller.getFilms(false, res);

      expect(mockStarwarsService.getFilms).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(films);
    });

    it('should handle errors when fetching films', async () => {
      const res = mockResponse();
      const error = new Error('Error de base de datos');

      mockStarwarsService.getFilms.mockRejectedValue(error);

      await controller.getFilms(false, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });

    it('should handle fullinfo parameter', async () => {
      const res = mockResponse();
      mockStarwarsService.getFilms.mockResolvedValue([mockFilm]);

      await controller.getFilms(true, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('getFilmsFromApi', () => {
    it('should return films from external API', async () => {
      const res = mockResponse();

      mockStarwarsService.getFilmsFromApi.mockResolvedValue(mockExternalFilms);

      await controller.getFilmsFromApi(false, res);

      expect(mockStarwarsService.getFilmsFromApi).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle API connection errors', async () => {
      const res = mockResponse();
      const error = new Error('API no disponible');

      mockStarwarsService.getFilmsFromApi.mockRejectedValue(error);

      await controller.getFilmsFromApi(false, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });

    it('should handle fullinfo parameter', async () => {
      const res = mockResponse();
      mockStarwarsService.getFilmsFromApi.mockResolvedValue(mockExternalFilms);

      await controller.getFilmsFromApi(true, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('syncFilms', () => {
    it('should sync films successfully', async () => {
      const res = mockResponse();
      const syncResult = {
        message: 'Sincronización completada',
        total: 6,
        success: 6,
        failed: 0,
        errors: [],
      };

      mockStarwarsService.syncFilmsFromApi.mockResolvedValue(syncResult);

      await controller.syncFilms(res);

      expect(mockStarwarsService.syncFilmsFromApi).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(syncResult);
    });

    it('should handle sync errors', async () => {
      const res = mockResponse();
      const error = new Error('Sincronización fallida');

      mockStarwarsService.syncFilmsFromApi.mockRejectedValue(error);

      await controller.syncFilms(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Error al sincronizar películas',
        error: error.message,
      });
    });

    it('should return partial sync results with errors', async () => {
      const res = mockResponse();
      const syncResult = {
        message: 'Sincronización completada',
        total: 6,
        success: 4,
        failed: 0,
        errors: ['Película "The Empire Strikes Back" omitida: ha sido modificada localmente'],
      };

      mockStarwarsService.syncFilmsFromApi.mockResolvedValue(syncResult);

      await controller.syncFilms(res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(syncResult);
    });
  });

  describe('createFilm', () => {
    const createFilmDto: CreateFilmDto = {
      title: 'New Film',
      episode_id: 10,
      opening_crawl: 'A new adventure...',
      director: 'New Director',
      producer: 'New Producer',
      release_date: '2024-01-01',
      characters: [],
      planets: [],
      starships: [],
      vehicles: [],
      species: [],
    };

    it('should create a new film', async () => {
      const res = mockResponse();
      const createdFilm = { ...mockFilm, ...createFilmDto, source: 'local' };

      mockStarwarsService.createFilm.mockResolvedValue(createdFilm);

      await controller.createFilm(createFilmDto, res);

      expect(mockStarwarsService.createFilm).toHaveBeenCalledWith(createFilmDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith(createdFilm);
    });

    it('should handle creation errors', async () => {
      const res = mockResponse();
      const error = new Error('Validación fallida');

      mockStarwarsService.createFilm.mockRejectedValue(error);

      await controller.createFilm(createFilmDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('getFilm', () => {
    it('should return a film by id', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';

      mockStarwarsService.getFilm.mockResolvedValue(mockFilm);

      await controller.getFilm(filmId, res);

      expect(mockStarwarsService.getFilm).toHaveBeenCalledWith(filmId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(mockFilm);
    });

    it('should return 404 when film not found', async () => {
      const res = mockResponse();
      const filmId = 'nonexistent-id';

      mockStarwarsService.getFilm.mockResolvedValue(null);

      await controller.getFilm(filmId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Película no encontrada' });
    });

    it('should handle errors when fetching film', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';
      const error = new Error('Error de base de datos');

      mockStarwarsService.getFilm.mockRejectedValue(error);

      await controller.getFilm(filmId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('updateFilm', () => {
    const updateFilmDto: UpdateFilmDto = {
      title: 'Updated Title',
      director: 'Updated Director',
    };

    it('should update a film successfully', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';
      const updatedFilm = { ...mockFilm, ...updateFilmDto };

      mockStarwarsService.updateFilm.mockResolvedValue(updatedFilm);

      await controller.updateFilm(filmId, updateFilmDto, res);

      expect(mockStarwarsService.updateFilm).toHaveBeenCalledWith(filmId, updateFilmDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(updatedFilm);
    });

    it('should return 404 when film not found', async () => {
      const res = mockResponse();
      const filmId = 'nonexistent-id';

      mockStarwarsService.updateFilm.mockResolvedValue(null);

      await controller.updateFilm(filmId, updateFilmDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Película no encontrada' });
    });

    it('should handle update errors', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';
      const error = new Error('Actualización fallida');

      mockStarwarsService.updateFilm.mockRejectedValue(error);

      await controller.updateFilm(filmId, updateFilmDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });

    it('should mark API films as modified', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';
      const updatedFilm = { ...mockFilm, ...updateFilmDto, isModified: true };

      mockStarwarsService.updateFilm.mockResolvedValue(updatedFilm);

      await controller.updateFilm(filmId, updateFilmDto, res);

      expect(res.send).toHaveBeenCalledWith(updatedFilm);
    });
  });

  describe('deleteFilm', () => {
    it('should delete a film successfully', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';

      mockStarwarsService.deleteFilm.mockResolvedValue(mockFilm);

      await controller.deleteFilm(filmId, res);

      expect(mockStarwarsService.deleteFilm).toHaveBeenCalledWith(filmId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Película eliminada exitosamente',
        film: mockFilm,
      });
    });

    it('should return 404 when film not found', async () => {
      const res = mockResponse();
      const filmId = 'nonexistent-id';

      mockStarwarsService.deleteFilm.mockResolvedValue(null);

      await controller.deleteFilm(filmId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'Película no encontrada' });
    });

    it('should handle deletion errors', async () => {
      const res = mockResponse();
      const filmId = '507f1f77bcf86cd799439011';
      const error = new Error('Eliminación fallida');

      mockStarwarsService.deleteFilm.mockRejectedValue(error);

      await controller.deleteFilm(filmId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });
});

