import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    password: string;
}