import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import {
  JwtPayload,
  JwtPayloadWithRefreshToken,
} from './types/jwt-payload.type';

interface AuthRequest {
  user: JwtPayload;
}
interface AuthRequestWithRefresh {
  user: JwtPayloadWithRefreshToken;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(dto);
    this.setTokenCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar tokens' })
  async refresh(
    @Request() req: AuthRequestWithRefresh,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.refresh(req.user.sub);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Tokens renovados' };
  }

  // Cierre de sesión que borra las cookies de tokens
  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Cerrar sesión' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  async getMe(@Request() req: AuthRequest) {
    return this.authService.getMe(req.user.sub);
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const base = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as
        | 'none'
        | 'lax',
      path: '/',
    };
    res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
