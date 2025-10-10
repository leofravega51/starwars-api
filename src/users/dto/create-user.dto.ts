import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { User } from "src/schemas/user.schema";
import { LoginDTO } from "./login-user.dto";

export class CreateUserDTO extends PartialType(LoginDTO) {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    displayName: string;

    @IsEmail()
    @MinLength(8)
    @MaxLength(100)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    password: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(30)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character' })
    confirmPassword: string;

    toEntity(): User {
        return new User({
            username: this.username,
            email: this.email || '',
            displayName: this.displayName,
            password: this.password,
        });
    }
}
