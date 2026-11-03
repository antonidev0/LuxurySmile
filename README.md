# Luxury Smile

Web de la clínica odontológica: página pública informativa (sin reserva online ni cuentas de pacientes) y panel privado para que el administrador y los doctores gestionen y creen citas, doctores e historiales médicos.

- `luxuryApp/`: frontend (React + Vite + Chakra UI)
- `luxuryBackend/`: backend (Node + Express + PostgreSQL con Prisma)

## Requisitos

- Node.js 20 o superior
- pnpm: si no lo tienes, instálalo una vez con `npm install -g pnpm` (o activa `corepack enable`)
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
pnpm install              # instala dependencias y genera el cliente de Prisma
pnpm db:deploy            # crea las tablas en la base de datos
pnpm crear-admin          # crea tu cuenta de administrador (te pide correo y contraseña)
pnpm dev                  # arranca el backend en http://localhost:3003
```

### 3. Frontend

En otra terminal:

```bash
cd luxuryApp
cp .env.example .env      # VITE_BACKEND_URL=http://localhost:3003
pnpm install
pnpm dev                  # abre http://localhost:5173
```

### 4. Probarlo

1. Entra en `/login` con el administrador que creaste.
2. Ve a **Registrar personal** y da de alta un doctor. Le llegará un correo para verificar su cuenta.
3. En **Calendario**, pulsa **Nueva cita** y regístrala con los datos del paciente (la web pública es solo informativa: no tiene reserva online).
4. En **Citas**, asígnale el doctor, cambia el estado y genera o sube el historial PDF. Los doctores también pueden crear citas en su propia agenda desde su calendario.

## Comandos útiles del backend

| Comando | Para qué |
| --- | --- |
| `pnpm db:studio` | Abre Prisma Studio para ver y editar los datos en el navegador |
| `pnpm db:migrate --name <cambio>` | Crea una migración tras cambiar `prisma/schema.prisma` |
| `pnpm db:deploy` | Aplica las migraciones pendientes (también en producción) |
| `pnpm crear-admin` | Crea un administrador, o convierte en admin una cuenta existente |
| `pnpm citas-prueba [n]` | Crea `n` citas de prueba (100 por defecto); `--borrar` las quita |
| `pnpm preparar-demo` | Con `DEMO_PASSWORD` definida, crea las cuentas de demo y completa hasta 100 citas de prueba futuras |

## Publicar una demo (Render + Neon, gratis)

La demo usa **su propia base de datos** con datos inventados: nunca pongas aquí la base de la clínica real.

1. **Base de datos:** en [Neon](https://neon.tech) crea un proyecto nuevo (por ejemplo `luxurysmile-demo`) y copia su *connection string*.
2. **Render:** crea una cuenta en [render.com](https://render.com) con tu GitHub y ve a **New > Blueprint**. Elige el repo `luxurysmile`: Render lee `render.yaml` y propone dos servicios, `luxurysmile-api` y `luxurysmile-panel`.
3. Rellena las variables que pide:
   - `DATABASE_URL`: la connection string de Neon del paso 1.
   - `DEMO_PASSWORD`: la contraseña de las cuentas de demo (mín. 8 caracteres, con mayúscula, minúscula y número).
   - `CLIENT_ORIGIN`: `https://luxurysmile-panel.onrender.com`
   - `VITE_BACKEND_URL`: `https://luxurysmile-api.onrender.com`

   Si Render te da otras URLs (porque el nombre ya estaba ocupado), cambia estas dos variables por las reales y vuelve a desplegar.
4. Pulsa **Apply**. En cada build la API aplica las migraciones y ejecuta `pnpm preparar-demo`, que crea las cuentas y deja siempre 100 citas de prueba futuras.

Cuentas de la demo (todas con `DEMO_PASSWORD`):

- Administrador: `admin@demo.luxurysmile.test`
- Doctores: `laura@demo.luxurysmile.test`, `andres@demo.luxurysmile.test`, `daniela@demo.luxurysmile.test`

Limitaciones del plan gratis: la API se duerme tras 15 minutos sin visitas (la primera petición tarda ~1 minuto en despertarla), y los PDF subidos se pierden al redesplegar porque el disco no es persistente. Sin `EMAIL_USER`/`EMAIL_PASS` no se envían correos de verificación.
