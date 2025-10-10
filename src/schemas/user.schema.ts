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
  
  @Prop({type: Boolean})
  isAuthenticated: boolean;

  constructor(partial?: Partial<User>) {
    super();
    Object.assign(this, partial);
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