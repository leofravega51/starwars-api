import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser123',
    email: 'test@example.com',
    displayName: 'Test User Display',
    password: '$2b$10$hashedPassword',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser123',
      email: 'test@example.com',
      displayName: 'Test User Display',
      password: '$2b$10$hashedPassword',
      role: 'user',
    }),
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsername: jest.fn(),
    validateUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (register)', () => {
    const createUserDto: CreateUserDTO = {
      username: 'newuser123',
      email: 'newuser@example.com',
      displayName: 'New User Display',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'user' as const
    };

    it('should create a user and return token', async () => {
      const res = mockResponse();
      const token = 'jwt-token-123';
      
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(token);

      await controller.create(createUserDto, res);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        username: mockUser.username,
        role: mockUser.role,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente',
        user: expect.not.objectContaining({ password: expect.anything() }),
        access_token: token,
      });
    });

    it('should handle errors during user creation', async () => {
      const res = mockResponse();
      const error = new Error('Error de base de datos');
      
      mockUsersService.create.mockRejectedValue(error);

      await controller.create(createUserDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser123',
      password: 'Password123!',
    };

    it('should authenticate user and return token', async () => {
      const res = mockResponse();
      const token = 'jwt-token-123';
      const userWithoutPassword = {
        _id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        displayName: mockUser.displayName,
        role: mockUser.role,
      };
      
      mockUsersService.validateUser.mockResolvedValue(userWithoutPassword);
      mockJwtService.sign.mockReturnValue(token);

      await controller.login(loginDto, res);

      expect(mockUsersService.validateUser).toHaveBeenCalledWith(loginDto.username, loginDto.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: userWithoutPassword._id,
        username: userWithoutPassword.username,
        role: userWithoutPassword.role,
      });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Login exitoso!',
        user: userWithoutPassword,
        access_token: token,
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const res = mockResponse();
      
      mockUsersService.validateUser.mockResolvedValue(null);

      await controller.login(loginDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Credenciales inválidas!',
      });
    });

    it('should handle errors during login', async () => {
      const res = mockResponse();
      const error = new Error('Error de base de datos');
      
      mockUsersService.validateUser.mockRejectedValue(error);

      await controller.login(loginDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const res = mockResponse();
      const users = [mockUser, { ...mockUser, _id: 'another-id' }];
      
      mockUsersService.findAll.mockResolvedValue(users);

      await controller.findAll(res);

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(users);
    });

    it('should handle errors when fetching users', async () => {
      const res = mockResponse();
      const error = new Error('Error de base de datos');
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockUsersService.findAll.mockRejectedValue(error);

      await controller.findAll(res);

      expect(consoleLogSpy).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await controller.findOne(userId, res);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors when fetching a user', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const error = new Error('Usuario no encontrado');
      
      mockUsersService.findOne.mockRejectedValue(error);

      await controller.findOne(userId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      displayName: 'Updated Display Name',
      email: 'updated@example.com',
    };

    it('should update a user successfully', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const updatedUser = { ...mockUser, ...updateUserDto };
      
      mockUsersService.update.mockResolvedValue(updatedUser);

      await controller.update(userId, updateUserDto, res);

      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith(updatedUser);
    });

    it('should handle errors during update', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const error = new Error('Actualización fallida');
      
      mockUsersService.update.mockRejectedValue(error);

      await controller.update(userId, updateUserDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const deletedUser = { ...mockUser, id: userId };
      
      mockUsersService.remove.mockResolvedValue(deletedUser);

      await controller.remove(userId, res);

      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith({ id: userId });
    });

    it('should handle errors during deletion', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const error = new Error('Eliminación fallida');
      
      mockUsersService.remove.mockRejectedValue(error);

      await controller.remove(userId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith(error);
    });

    it('should handle case when deleted user has no id property', async () => {
      const res = mockResponse();
      const userId = '507f1f77bcf86cd799439011';
      const deletedUser = { ...mockUser };
      delete (deletedUser as any).id;
      
      mockUsersService.remove.mockResolvedValue(deletedUser);

      await controller.remove(userId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith({ id: undefined });
    });
  });
});
