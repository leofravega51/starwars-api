import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock de bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

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

  const mockUserModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'newuser123',
      email: 'newuser@example.com',
      displayName: 'New User Display',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'user' as const,
      toEntity: jest.fn(),
    };

    it('should create a new user successfully', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto as any);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: createUserDto.username });
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if username already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto as any)).rejects.toThrow(
        new HttpException('Ya existe un usuario con ese nombre de usuario', HttpStatus.BAD_REQUEST)
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: createUserDto.username });
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });

    it('should throw an error if passwords do not match', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const invalidDto = {
        ...createUserDto,
        confirmPassword: 'DifferentPass123!',
      };

      await expect(service.create(invalidDto as any)).rejects.toThrow(
        new HttpException('Las contraseñas no coinciden', HttpStatus.BAD_REQUEST)
      );
      expect(mockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [mockUser, { ...mockUser, _id: 'another-id' }];
      const selectMock = jest.fn().mockResolvedValue(users);
      mockUserModel.find.mockReturnValue({ select: selectMock } as any);

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalledWith({});
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual(users);
    });

    it('should return users with filter applied', async () => {
      const filter = { role: 'admin' as const };
      const selectMock = jest.fn().mockResolvedValue([mockUser]);
      mockUserModel.find.mockReturnValue({ select: selectMock } as any);

      const result = await service.findAll(filter);

      expect(mockUserModel.find).toHaveBeenCalledWith(filter);
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual([mockUser]);
    });

    it('should return empty array if no users found', async () => {
      const selectMock = jest.fn().mockResolvedValue([]);
      mockUserModel.find.mockReturnValue({ select: selectMock } as any);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.findById.mockReturnValue({ select: selectMock } as any);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      mockUserModel.findById.mockReturnValue({ select: selectMock } as any);

      const result = await service.findOne('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser123');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser123' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const userWithPassword = {
        ...mockUser,
        password: '$2b$10$hashedPassword',
      };
      mockUserModel.findOne.mockResolvedValue(userWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser123', 'Password123!');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser123' });
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', '$2b$10$hashedPassword');
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'Password123!');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if user has no password', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      mockUserModel.findOne.mockResolvedValue(userWithoutPassword);

      const result = await service.validateUser('testuser123', 'Password123!');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password is invalid', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser123', 'WrongPassword!');

      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword!', '$2b$10$hashedPassword');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateUserDto = {
      displayName: 'Updated Display Name',
      email: 'updated@example.com',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await service.update('507f1f77bcf86cd799439011', updateUserDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if update fails', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.update('507f1f77bcf86cd799439011', updateUserDto)).rejects.toThrow(
        new HttpException('Fallo la actualización del usuario', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await service.remove('507f1f77bcf86cd799439011');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if deletion fails', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        new HttpException('Error al eliminar el usuario', HttpStatus.BAD_REQUEST)
      );
    });
  });
});
