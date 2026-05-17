import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

// Esta clave es la que usará el RolesGuard para buscar los metadatos
export const ROLES_KEY = 'roles';

// Este es el decorador que usarás como @Roles(UserRole.CREATOR)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
