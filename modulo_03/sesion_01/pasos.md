# JWT

## Creamos el proyecto y entramos en el directorio

```bash
nest new nest-jwt-auth
cd nest-jwt-auth
```

## Instalamos las dependencias

```bash
pnpm add -P @nestjs/jwt @nestjs/passport passport passport-jwt cookie-parser
pnpm add -P @nestjs/config class-validator
pnpm add -D @types/passport-jwt
```

## Creamos archivo .env

```
JWT_SECRET=mi_clave_super_secreta
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Generamos los resources para user y auth

```bash
nest g module users
nest g service users
nest g controller users
nest g module auth
nest g service auth
nest g controller auth
```

## Archivos Auth

### En auth.service.ts

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Aqui deberiamos validar con encryptación, usando bcrypt o argon2
    const isValid = user.password === password;
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) throw new UnauthorizedException();

      const new_access_token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        { 
          expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m'
        },
      );

      const new_refresh_token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        }, 
        {
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        }
      );

      return { access_token: new_access_token, refresh_token: new_refresh_token };
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
```

### En auth.controller.ts

```ts
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('login-secure')
  async loginSegure(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const value = await this.authService.login(user);
    res.cookie('refresh_token', value.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return {
      access_token: value.access_token,
      user: value.user
    };
  }

  @Post('refresh-token')
  async refresh(@Body('refresh_token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Post('refresh-token-secure')
  async refreshSecure(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refresh_token']
    if (!token) throw new UnauthorizedException()
    const value = await this.authService.refreshToken(token);

    res.cookie('refresh_token', value.refresh_token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    
    return {
      access_token: (await value).access_token
    }
  }

  @Post('logout')
  async logout() {
    return { message: 'Sesión cerrada' };
  }
}
```

### Creamos archivo /src/auth/jwt-auth.guard.ts

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Creamos archivo /src/auth/jwt.strategy.ts

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

### En auth.module.ts

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Creamos archivo /src/auth/dto/login.dto.ts

```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

## Archivos Users

### En archivo users.service.ts

```ts
import { Injectable } from '@nestjs/common';

const fakeUsers = [
  { id: 1, name: 'Fernando Benavides', email: 'fernando@edex.pe', password: '123456', role: 'user' },
];

@Injectable()
export class UsersService {
  constructor(
  ) {}

  async findById(id: number): Promise<any | null> {
    return fakeUsers.find(user => user.id === id);
  }

  async findByEmail(email: string) {
    return fakeUsers.find(user => user.email === email);
  }
}
```

### En archivo users.controller.ts

```ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUserId() userId: number) {
    const user = await this.usersService.findById(userId);
    return {
      id: user?.id ?? '',
      role: user?.role ?? '',
      name: user?.name ?? '',
      lastname: user?.lastname ?? '',
      email: user?.email ?? '',
    };
  }
}
```

### Crear archivo /src/common/decorators/get-user-id.decorator.ts

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
```

### En archivo users.module.ts

```ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

### En app.module.ts

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### En main.ts

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### Importar archivo NestJS JWT Auth API.postman_collection.json