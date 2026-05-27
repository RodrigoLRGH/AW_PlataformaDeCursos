# Plataforma de Cursos

**Materia:** Aplicaciones Web

**Grupo:** ISyTE G-961 2026

**Equipo:**

- Lira Palafox
- López Rojas
- Mar Garcia

## Descripción

Aplicación web para la creación y consumo de cursos en línea. Los creadores pueden diseñar cursos con lecciones y exámenes, mientras los estudiantes pueden inscribirse, seguir su progreso, obtener certificados y participar en foros.

## Tecnologías utilizadas

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- React Router
- React Hook Form + Zod
- Axios

### Backend
- NestJS + TypeScript
- TypeORM + PostgreSQL
- Passport JWT (access + refresh tokens)
- bcryptjs
- PDFKit

## Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Variables de entorno

### Backend: `plataforma-cursos-backend/.env`

```env
# Base de datos
DB_URL=postgresql://postgres:tu_contraseña@localhost:5432/plataforma_cursos

# JWT
JWT_ACCESS_SECRET=tu_access_secret
JWT_REFRESH_SECRET=tu_refresh_secret

# App
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend: `plataforma-cursos-frontend/.env`

```env
VITE_API_URL=http://localhost:3000
```

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/plataforma-cursos.git
cd plataforma-cursos
```

### 2. Configurar el backend

```bash
cd plataforma-cursos-backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL y secretos JWT
```

### 3. Crear la base de datos

```bash
# En PostgreSQL crea la base de datos
psql -U postgres -c "CREATE DATABASE cursos_db;"
```

> Con `synchronize: true` en TypeORM, las tablas se crean automáticamente al levantar el backend.

### 4. Configurar el frontend

```bash
cd ../plataforma-cursos-frontend
npm install
cp .env.example .env
# Edita VITE_API_URL si el backend corre en otro puerto
```

## Correr el proyecto

### Backend

```bash
cd plataforma-cursos-backend
npm run start
```

El servidor corre en `http://localhost:3000`
Swagger disponible en `http://localhost:3000/api/docs`

### Frontend

```bash
cd plataforma-cursos-frontend
npm run dev
```

La app corre en `http://localhost:5173`

## Funcionalidades

## Roles del sistema

| Rol | Permisos |
|-----|----------|
| `student` | Inscribirse a cursos, ver lecciones, tomar exámenes, obtener certificados, participar en foros |
| `creator` | Crear/editar/eliminar sus cursos, gestionar lecciones, gestionar exámenes |

---
