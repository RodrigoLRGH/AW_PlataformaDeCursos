import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Método para registrar un nuevo usuario, verifica si el email ya existe y hashea la contraseña antes de guardar
  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { role, ...userData } = dto;
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: role as unknown as UserRole,
    });

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  // Método para iniciar sesión, verifica las credenciales y devuelve los tokens de acceso y refresco junto con los datos del usuario
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.getTokens(user.id, user.email, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Método para renovar tokens, recibe el ID del usuario y devuelve nuevos tokens de acceso y refresco
  async refresh(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return this.getTokens(user.id, user.email, user.role);
  }

  // Método para cerrar sesión, en este caso simplemente devuelve un mensaje ya que las cookies se manejan en el controlador
  async logout() {
    return { message: 'Sesión cerrada' };
  }

  // Método para obtener los datos del usuario autenticado, recibe el ID del usuario y devuelve sus datos sin la contraseña
  async getMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  // Método privado para generar tokens de acceso y refresco, recibe el ID, email y rol del usuario y devuelve ambos tokens firmados
  private async getTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}