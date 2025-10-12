import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { User } from "src/schemas/user.schema";
import type { Role } from "src/schemas/user.schema";
import { LoginDTO } from "./login-user.dto";

export class CreateUserDTO extends PartialType(LoginDTO) {
    @ApiProperty({
        description: 'Nombre de usuario único',
        example: 'johndoe123',
        minLength: 8,
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    username: string;

    @ApiProperty({
        description: 'Nombre para mostrar del usuario',
        example: 'John Doe',
        minLength: 8,
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    displayName: string;

    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'john.doe@example.com',
        minLength: 8,
        maxLength: 100,
    })
    @IsEmail()
    @MinLength(8)
    @MaxLength(100)
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario (debe contener mayúsculas, minúsculas, números y caracteres especiales)',
        example: 'SecurePass123!',
        minLength: 8,
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    password: string;
    
    @ApiProperty({
        description: 'Confirmación de contraseña',
        example: 'SecurePass123!',
        minLength: 8,
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    confirmPassword: string;

    @ApiPropertyOptional({
        description: 'Rol del usuario en el sistema',
        enum: ['admin', 'user'],
        default: 'user',
        example: 'user',
    })
    @IsEnum(['admin', 'user'], { message: 'role must be one of the following values: admin, user' })
    @IsOptional()
    role?: Role;
}
