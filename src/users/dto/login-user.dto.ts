import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDTO {
    @ApiProperty({
        description: 'Nombre de usuario',
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
        description: 'Contraseña del usuario',
        example: 'SecurePass123!',
        minLength: 8,
        maxLength: 30,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    password: string;
}