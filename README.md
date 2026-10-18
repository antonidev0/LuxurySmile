# Luxury Smile

Web de la clínica odontológica: página pública con solicitud de citas y panel de administración para gestionar citas, doctores e historiales médicos.

- `luxuryApp/`: frontend (React + Vite + Chakra UI)
- `luxuryBackend/`: backend (Node + Express + PostgreSQL con Prisma)

## Requisitos

- Node.js 20 o superior
- Una base de datos PostgreSQL. La más cómoda es una gratuita en [Neon](https://neon.tech), que se despierta sola cuando la usas. También puedes usar PostgreSQL local o Docker (abajo).

## Correrlo en local

### 1. Base de datos

**Opción A: Neon (recomendada)**

1. Crea una cuenta en neon.tech y un proyecto nuevo (nombre de la base: `luxurysmile`).
2. En el panel, pulsa **Connect** y copia la *connection string* (empieza por `postgresql://` y termina en `?sslmode=require`).

**Opción B: Docker**

```bash
docker run --name luxurysmile-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=luxurysmile -p 5432:5432 -d postgres:16
```

En este caso, la URL es `postgresql://postgres:postgres@localhost:5432/luxurysmile`.

### 2. Backend

```bash
cd luxuryBackend
cp .env.example .env      # en Windows: copy .env.example .env
```

Edita `.env` y pon como mínimo `DATABASE_URL` (la URL del paso 1) y `JWT_SECRET` (cualquier texto largo y aleatorio). Para que lleguen los correos de verificación, rellena también `EMAIL_USER` y `EMAIL_PASS` (en Gmail, una *contraseña de aplicación*).

```bash
npm install               # instala dependencias y genera el cliente de Prisma
npm run db:deploy         # crea las tablas en la base de datos
npm run crear-admin       # crea tu cuenta de administrador (te pide correo y contraseña)
npm run dev               # arranca el backend en http://localhost:3003
```

### 3. Frontend

En otra terminal:

```bash
cd luxuryApp
cp .env.example .env      # VITE_BACKEND_URL=http://localhost:3003
npm install
npm run dev               # abre http://localhost:5173
```

### 4. Probarlo

1. Entra en `/login` con el administrador que creaste.
2. Ve a **Registrar personal** y da de alta un doctor. Le llegará un correo para verificar su cuenta.
3. Desde la web pública (**Solicitar cita**), pide una cita.
4. En **Asignar** (gestión de citas), asígnale el doctor, cambia el estado y genera o sube el historial PDF.

## Comandos útiles del backend

| Comando | Para qué |
| --- | --- |
| `npm run db:studio` | Abre Prisma Studio para ver y editar los datos en el navegador |
| `npm run db:migrate -- --name <cambio>` | Crea una migración tras cambiar `prisma/schema.prisma` |
| `npm run db:deploy` | Aplica las migraciones pendientes (también en producción) |
| `npm run crear-admin` | Crea un administrador, o convierte en admin una cuenta existente |
