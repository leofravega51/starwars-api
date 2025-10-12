import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) { }

  async create(createUserDto: CreateUserDTO) {
    const userExists = await this.userModel.findOne({ username: createUserDto.username });
    if(userExists) throw new HttpException('Ya existe un usuario con ese nombre de usuario', HttpStatus.BAD_REQUEST);
    
    // Validar que las contraseñas coincidan
    if(createUserDto.password !== createUserDto.confirmPassword) {
      throw new HttpException('Las contraseñas no coinciden', HttpStatus.BAD_REQUEST);
    }
    
    const newUser = new User({
      username: createUserDto.username,
      email: createUserDto.email,
      displayName: createUserDto.displayName,
      password: createUserDto.password,
      role: createUserDto.role || 'user', // Por defecto 'user'
    });
    
    if(!newUser) throw new HttpException('Error al crear usuario', HttpStatus.BAD_REQUEST);
    return await this.userModel.create(newUser);
  }

  async findAll(filter?: Partial<User>) {
    const users = await this.userModel.find(filter || {}).select('-password'); // No devolver password
    return users || [];
  }

  async findOne(id: string) {
    return await this.userModel.findById(id).select('-password'); // No devolver password
  }

  async findByUsername(username: string) {
    return await this.userModel.findOne({ username });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findByUsername(username);
    if (!user || !user.password) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Retornar usuario sin el password
    const { password: _, ...result } = user.toObject();
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto);
    if(!updatedUser) throw new HttpException('Fallo la actualización del usuario', HttpStatus.BAD_REQUEST);
    return updatedUser;
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if(!deletedUser) throw new HttpException('Error al eliminar el usuario', HttpStatus.BAD_REQUEST);
    return deletedUser;
  }
}
