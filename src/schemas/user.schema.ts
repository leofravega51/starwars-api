/* eslint-disable @typescript-eslint/ban-types */
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Base } from "src/shared/interfaces";
import * as bcrypt from 'bcrypt';

export type Role = "admin" | "user";

@Schema({ timestamps: true })
export class User extends Base {
  @Prop({ required: true, trim: true, type: String, unique: true, lowercase: true, minlength: 8, maxlength: 30 })
  username: string;

  @Prop({ trim: true, type: String, unique: true, lowercase: true, minlength: 8, maxlength: 100 })
  email: string;

  @Prop({ required: true, trim: true, type: String, minlength: 8, maxlength: 30 })
  password?: string;

  @Prop({ trim: true, type: String, minlength: 8, maxlength: 50 })
  displayName?: string;

  @Prop({ trim: true, type: String, enum: ['admin', 'user'] })
  role: Role;

  constructor(partial?: Partial<User>) {
    super();
    
    if (!partial) {
      throw new Error('No se proporcionaron datos para crear el usuario');
    }
    
    // Validar campos requeridos
    const requiredFields: Array<keyof User> = ['username', 'password'];
    const missingFields = requiredFields.filter(field => {
      const value = partial[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Faltan los siguientes campos requeridos: ${missingFields.join(', ')}`);
    }
    
    // Validar tipos de datos
    if (typeof partial.username !== 'string') {
      throw new Error('El campo "username" debe ser una cadena de texto');
    }
    
    if (typeof partial.password !== 'string') {
      throw new Error('El campo "password" debe ser una cadena de texto');
    }
    
    // Validar longitudes mínimas y máximas
    if (partial.username.length < 8 || partial.username.length > 30) {
      throw new Error('El campo "username" debe tener entre 8 y 30 caracteres');
    }
    
    if (partial.password.length < 8 || partial.password.length > 30) {
      throw new Error('El campo "password" debe tener entre 8 y 30 caracteres');
    }
    
    // Validar campos opcionales si están presentes
    if (partial.email !== undefined) {
      if (typeof partial.email !== 'string') {
        throw new Error('El campo "email" debe ser una cadena de texto');
      }
      if (partial.email.length < 8 || partial.email.length > 100) {
        throw new Error('El campo "email" debe tener entre 8 y 100 caracteres');
      }
    }
    
    if (partial.displayName !== undefined) {
      if (typeof partial.displayName !== 'string') {
        throw new Error('El campo "displayName" debe ser una cadena de texto');
      }
      if (partial.displayName.length < 8 || partial.displayName.length > 50) {
        throw new Error('El campo "displayName" debe tener entre 8 y 50 caracteres');
      }
    }
    
    if (partial.role !== undefined) {
      if (partial.role !== 'admin' && partial.role !== 'user') {
        throw new Error('El campo "role" debe ser "admin" o "user"');
      }
    }
    
    Object.assign(this, partial);
  }

  getUserRole() {
    return this.role;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function (next: Function) {
  // Solo hashear si el password existe y no está ya hasheado (bcrypt hashes comienzan con $2)
  if (this.password && !this.password.startsWith('$2')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});