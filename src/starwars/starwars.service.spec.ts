import { Test, TestingModule } from '@nestjs/testing';
import { StarwarsService } from './starwars.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Film } from './schemas/film.schema';
import { Model } from 'mongoose';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('StarwarsService', () => {
  let service: StarwarsService;
  let filmModel: Model<Film>;
  let httpService: HttpService;

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

  const mockSwapiResponse = {
    message: 'ok',
    result: [
      {
        properties: {
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
        },
        description: 'Primera película de Star Wars',
        uid: '1',
      },
    ],
  };

  const mockFilmModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    exec: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarwarsService,
        {
          provide: getModelToken(Film.name),
          useValue: mockFilmModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<StarwarsService>(StarwarsService);
    filmModel = module.get<Model<Film>>(getModelToken(Film.name));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFilmsFromApi', () => {
    it('should fetch films from external API', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockSwapiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getFilmsFromApi();

      expect(result).toEqual(mockSwapiResponse.result);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/films'),
        undefined
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('Conexión con API fallida');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getFilmsFromApi()).rejects.toThrow();
    });
  });

  describe('getFilmFromApi', () => {
    it('should fetch a single film from external API', async () => {
      const singleFilmResponse = {
        message: 'ok',
        result: mockSwapiResponse.result[0],
      };

      const axiosResponse: AxiosResponse = {
        data: singleFilmResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));

      const result = await service.getFilmFromApi('1');

      expect(result).toEqual(singleFilmResponse.result);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/films/1'),
        undefined
      );
    });

    it('should handle errors when fetching single film', async () => {
      const error = new Error('Película no encontrada');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getFilmFromApi('999')).rejects.toThrow();
    });
  });

  describe('createFilm', () => {
    const createFilmData = {
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
      const createdFilm = { ...mockFilm, ...createFilmData, source: 'local' };
      mockFilmModel.create.mockResolvedValue(createdFilm);

      const result = await service.createFilm(createFilmData);

      expect(mockFilmModel.create).toHaveBeenCalled();
      expect(result).toEqual(createdFilm);
    });

    it('should create film with default empty arrays', async () => {
      const minimalData = {
        title: 'New Film',
        episode_id: 10,
        opening_crawl: 'A new adventure...',
        director: 'New Director',
        producer: 'New Producer',
        release_date: '2024-01-01',
      };

      mockFilmModel.create.mockResolvedValue({ ...minimalData, source: 'local' });

      await service.createFilm(minimalData);

      expect(mockFilmModel.create).toHaveBeenCalled();
    });

    it('should handle errors during film creation', async () => {
      const error = new Error('Error de base de datos');
      mockFilmModel.create.mockRejectedValue(error);

      await expect(service.createFilm(createFilmData)).rejects.toThrow('Error de base de datos');
    });
  });

  describe('getFilms', () => {
    it('should return all films from database', async () => {
      const films = [mockFilm, { ...mockFilm, _id: 'another-id' }];
      mockFilmModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(films),
      });

      const result = await service.getFilms();

      expect(mockFilmModel.find).toHaveBeenCalled();
      expect(result).toEqual(films);
    });

    it('should return empty array when no films exist', async () => {
      mockFilmModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getFilms();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Conexión de base de datos fallida');
      mockFilmModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.getFilms()).rejects.toThrow('Conexión de base de datos fallida');
    });
  });

  describe('getFilm', () => {
    it('should return a film by id', async () => {
      mockFilmModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFilm),
      });

      const result = await service.getFilm('507f1f77bcf86cd799439011');

      expect(mockFilmModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockFilm);
    });

    it('should return null when film not found', async () => {
      mockFilmModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getFilm('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Error de base de datos');
      mockFilmModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.getFilm('507f1f77bcf86cd799439011')).rejects.toThrow();
    });
  });

  describe('updateFilm', () => {
    const updateData = {
      title: 'Updated Title',
      director: 'Updated Director',
    };

    it('should update a film and mark as modified if source is api', async () => {
      const filmFromApi = { ...mockFilm, source: 'api' as const };
      mockFilmModel.findById.mockResolvedValue(filmFromApi);
      mockFilmModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...filmFromApi, ...updateData, isModified: true }),
      });

      const result = await service.updateFilm('507f1f77bcf86cd799439011', updateData);

      expect(mockFilmModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(mockFilmModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({ isModified: true }),
        { new: true }
      );
      expect(result?.isModified).toBe(true);
    });

    it('should update a local film without marking as modified', async () => {
      const localFilm = { ...mockFilm, source: 'local' as const };
      mockFilmModel.findById.mockResolvedValue(localFilm);
      mockFilmModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...localFilm, ...updateData }),
      });

      const result = await service.updateFilm('507f1f77bcf86cd799439011', updateData);

      expect(mockFilmModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateData,
        { new: true }
      );
    });

    it('should return null when film not found', async () => {
      mockFilmModel.findById.mockResolvedValue(null);
      mockFilmModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateFilm('nonexistent-id', updateData);

      expect(result).toBeNull();
    });

    it('should handle update errors', async () => {
      const error = new Error('Actualización fallida');
      mockFilmModel.findById.mockResolvedValue(mockFilm);
      mockFilmModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.updateFilm('507f1f77bcf86cd799439011', updateData)).rejects.toThrow();
    });
  });

  describe('deleteFilm', () => {
    it('should delete a film by id', async () => {
      mockFilmModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFilm),
      });

      const result = await service.deleteFilm('507f1f77bcf86cd799439011');

      expect(mockFilmModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockFilm);
    });

    it('should return null when film not found', async () => {
      mockFilmModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.deleteFilm('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Eliminación fallida');
      mockFilmModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.deleteFilm('507f1f77bcf86cd799439011')).rejects.toThrow();
    });
  });

  describe('syncFilmsFromApi', () => {
    it('should sync films successfully', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockSwapiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));
      mockFilmModel.findOne.mockResolvedValue(null); // No existing films
      mockFilmModel.create.mockResolvedValue(mockFilm);

      const result = await service.syncFilmsFromApi();

      expect(result.message).toBe('Sincronización completada');
      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should update existing unmodified films', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockSwapiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      const existingFilm = { ...mockFilm, isModified: false };
      mockHttpService.get.mockReturnValue(of(axiosResponse));
      mockFilmModel.findOne.mockResolvedValue(existingFilm);
      mockFilmModel.findByIdAndUpdate.mockResolvedValue({ ...existingFilm, lastSyncDate: new Date() });

      const result = await service.syncFilmsFromApi();

      expect(result.success).toBe(1);
      expect(mockFilmModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should skip modified films', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockSwapiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      const modifiedFilm = { ...mockFilm, isModified: true };
      mockHttpService.get.mockReturnValue(of(axiosResponse));
      mockFilmModel.findOne.mockResolvedValue(modifiedFilm);

      const result = await service.syncFilmsFromApi();

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('omitida');
      expect(mockFilmModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle partial sync failures', async () => {
      const multiFilmResponse = {
        message: 'ok',
        result: [
          mockSwapiResponse.result[0],
          { ...mockSwapiResponse.result[0], uid: '2' },
        ],
      };

      const axiosResponse: AxiosResponse = {
        data: multiFilmResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));
      mockFilmModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockFilmModel.create
        .mockResolvedValueOnce(mockFilm)
        .mockRejectedValueOnce(new Error('Error de validación'));

      const result = await service.syncFilmsFromApi();

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });

    it('should handle API connection errors', async () => {
      const error = new Error('API no disponible');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.syncFilmsFromApi()).rejects.toThrow('Error al sincronizar películas');
    });

    it('should create new films during sync', async () => {
      const axiosResponse: AxiosResponse = {
        data: mockSwapiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValue(of(axiosResponse));
      mockFilmModel.findOne.mockResolvedValue(null);
      mockFilmModel.create.mockResolvedValue(mockFilm);

      const result = await service.syncFilmsFromApi();

      expect(mockFilmModel.create).toHaveBeenCalled();
      expect(result.success).toBe(1);
    });
  });
});

