import { Controller, Get, Post, Body, Param, Delete, HttpStatus, Put, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

@ApiTags('Authentication')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // Endpoint público para registro (sin guard)
  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema y devuelve un token JWT' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente',
    schema: {
      example: {
        message: 'Usuario creado exitosamente',
        user: {
          username: 'johndoe123',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          role: 'user',
          _id: '507f1f77bcf86cd799439011',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async create(
    @Body() createUserDto: CreateUserDTO,
    @Res() res: Response
  ) {
    try {
      const user = await this.usersService.create(createUserDto);
      
      // Generar token JWT
      const payload = { 
        sub: user._id, 
        username: user.username,
        role: user.role 
      };
      const token = this.jwtService.sign(payload);
      
      // No devolver el password
      const { password, ...userWithoutPassword } = user.toObject();
      
      return res.status(HttpStatus.CREATED).send({ 
        message: 'Usuario creado exitosamente', 
        user: userWithoutPassword,
        access_token: token 
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  // Endpoint público para login
  @Post('login')
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token JWT' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    schema: {
      example: {
        message: 'Login exitoso!',
        user: {
          username: 'johndoe123',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          role: 'user',
          _id: '507f1f77bcf86cd799439011'
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async login(
    @Body() loginDto: LoginDTO,
    @Res() res: Response
  ) {
    try {
      const user = await this.usersService.validateUser(loginDto.username, loginDto.password);
      
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).send({ 
          message: 'Credenciales inválidas!' 
        });
      }

      const payload = { 
        sub: user._id, 
        username: user.username,
        role: user.role 
      };
      const token = this.jwtService.sign(payload);
      
      return res.status(HttpStatus.OK).send({ 
        message: 'Login exitoso!',
        user,
        access_token: token 
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  // Endpoints protegidos con JWT
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Devuelve la lista de todos los usuarios (requiere autenticación)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          username: 'johndoe123',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido o faltante' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async findAll(
    @Res() res: Response
  ) {
    try {
      const users = await this.usersService.findAll();
      res.status(HttpStatus.OK).send(users)
    } catch (error) {
      console.log(error)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Devuelve la información de un usuario específico (requiere autenticación)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado exitosamente',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        username: 'johndoe123',
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        role: 'user',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async findOne(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const user = await this.usersService.findOne(id);
      res.status(HttpStatus.OK).send(user)
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario existente (requiere autenticación)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        username: 'johndoe123',
        email: 'john.doe@example.com',
        displayName: 'John Doe Updated',
        role: 'user',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response
  ) {
    try {
      const updatedUserInfo = await this.usersService.update(id, updateUserDto);
      res.status(HttpStatus.OK).send(updatedUserInfo)
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema (requiere autenticación)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  async remove(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const deletedUser = await this.usersService.remove(id);
      res.status(HttpStatus.OK).send({id: deletedUser?.id})
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error)
    } 
  }
}
