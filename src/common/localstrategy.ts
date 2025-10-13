import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from 'src/shared/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET || 'default-secret-key',
        });
    }

    async validate(payload: any) {
        if (!payload) {
            throw new UnauthorizedException('Token inválido');
        }
        return { 
            userId: payload.sub, 
            username: payload.username,
            role: payload.role // Incluir el rol del usuario
        };
    }
}
