# CLAUDE.md

Guía para trabajar en **luxurybackend**, el backend de una web de **citas odontológicas**. Léela antes de escribir o modificar código.

## Dominio

Gestiona pacientes, profesionales/clínicas, agenda y reserva de citas. Implica **datos personales y de salud**, así que la privacidad no es opcional: minimiza lo que guardas y lo que expones, y trata los datos del paciente con el mismo cuidado que una credencial.

## Stack

- **Runtime:** Node.js con ES Modules (`"type": "module"` → usa `import`/`export`, nunca `require`).
- **Framework:** Express 4.
- **ORM:** Prisma 6 (`@prisma/client`).
- **Auth:** JWT (`jsonwebtoken`) + hashing con `bcrypt`.
- **Uploads:** `multer`. **PDFs:** `pdf-lib`. **Correo:** `nodemailer`.
- **Gestor de paquetes:** pnpm 10 (declarado en `packageManager`). Usa siempre `pnpm`, nunca `npm` ni `yarn`.

## Comandos

```bash
pnpm dev            # desarrollo con nodemon
pnpm start          # producción
pnpm db:migrate     # crear/aplicar migración en dev
pnpm db:deploy      # aplicar migraciones en producción
pnpm db:studio      # abrir Prisma Studio
pnpm crear-admin    # script scripts/crear-admin.js
pnpm probar-correo  # script scripts/probar-correo.js
```

Tras tocar `schema.prisma`: ejecuta `pnpm db:migrate` y deja que el `postinstall` regenere el cliente (`prisma generate`).

## Estructura y arquitectura

Todo el código vive en `src/`. Sigue una arquitectura en **capas**, con una responsabilidad clara por capa:

```
Request → Router → Middleware → Controller → Service → Repository (Prisma) → DB
```

- **Routers** (`src/routes/`): solo definen rutas y encadenan middlewares. Cero lógica de negocio.
- **Controllers** (`src/controllers/`): leen `req`, llaman a un service, devuelven la respuesta. No tocan Prisma directamente.
- **Services** (`src/services/`): lógica de negocio. Aquí vive el "qué" y el "cómo".
- **Repositories / data** (`src/repositories/` o `src/models/`): único lugar que habla con `PrismaClient`.
- **Middlewares** (`src/middlewares/`): auth, validación, manejo de errores, uploads.
- **Utils / lib** (`src/lib/`): helpers puros y reutilizables (JWT, hashing, mailer, generación de PDF).

**Regla de oro:** un controller nunca importa `PrismaClient` ni arma queries. Si lo necesita, va a través de un service.

### PrismaClient

Instancia **una sola vez** y expórtala desde `src/lib/prisma.js`. Nunca crees `new PrismaClient()` dentro de controllers o services sueltos (agota el pool de conexiones).

## Convenciones de código

- **Idioma:** nombres de variables, funciones y archivos en inglés o español, pero **consistentes** con lo que ya existe en el repo. No mezcles dentro de un mismo archivo.
- Funciones cortas y con una sola responsabilidad. Si pasa de ~30 líneas o anida más de 2 niveles, extrae.
- Usa **guard clauses** / early returns en vez de `if` anidados.
- Nada de constantes hardcodeadas ni secretos en el código: todo por `process.env` vía `dotenv`.
- Comentarios: explican el **porqué**, no el qué. Si un comentario describe lo que hace el código, reescribe el código.
- `async/await` siempre; nada de callbacks ni `.then()` encadenados.

## Manejo de errores

- Usa un **middleware de errores centralizado** registrado al final (`app.use(errorHandler)`). Los controllers no envían errores a mano uno por uno.
- Los controllers async envuelven la lógica para que los errores lleguen a `next(err)` (patrón `asyncHandler` o try/catch que llama a `next`).
- **Nunca** filtres stack traces, mensajes de Prisma crudos ni detalles internos al cliente en producción.
- Respuestas de error con formato consistente: `{ error: { message, code } }` y un status HTTP correcto.

## Seguridad y privacidad (obligatorio en este backend)

Maneja auth y **datos personales y de salud de pacientes**, así que:

- **Valida todo input externo** (body, params, query, uploads) en el borde con `zod` antes de llegar al service. No confíes en el cliente.
- `bcrypt` para passwords (nunca guardar en claro). Compara con `bcrypt.compare`.
- JWT: firma con `process.env.JWT_SECRET`, expiración razonable, y si usas cookies → `httpOnly: true`, `secure` en producción, `sameSite`.
- **Autorización por rol/propietario:** un paciente solo accede a sus propias citas y datos; un profesional solo a los de su clínica. Comprueba la pertenencia en el service, no solo que esté autenticado.
- Añade `helmet` (cabeceras de seguridad) y `express-rate-limit` en las rutas de auth (`/login`, `/register`, `/forgot-password`).
- CORS configurado con allowlist explícita de orígenes, no `*`.
- Uploads (multer): limita tamaño y tipos MIME permitidos; nunca sirvas la carpeta de uploads entera como estática sin control. Los documentos clínicos/PDFs no deben quedar accesibles por URL pública adivinable.
- **Minimiza datos personales en logs:** nunca loguees nombres, emails, teléfonos ni datos de salud. Usa identificadores internos.
- Protección de datos (RGPD si hay usuarios en la UE): guarda solo lo necesario, ten una vía para borrar/anonimizar datos de un paciente, y no envíes datos sensibles en query strings.

## Testing

- Framework: **Vitest** + **Supertest** para endpoints.
- Tests junto al código (`*.test.js`) o en `tests/`.
- Toda ruta de auth y todo service con lógica crítica debe tener al menos un test de camino feliz + uno de error.
- No marques una tarea como terminada con tests en rojo.

## Calidad

- **ESLint + Prettier** configurados; el código se formatea antes de commitear.
- Sin código muerto ni comentado "por si acaso". Bórralo (está en git).
- DRY: extrae lógica repetida, pero no abstraigas de más (YAGNI).

## Base de datos (Prisma)

- Cambios de esquema → siempre vía migración (`pnpm db:migrate`), nunca editando la DB a mano.
- Usa `select`/`include` explícitos para no traer campos de más (especialmente passwords/hashes).
- Transacciones (`prisma.$transaction`) cuando varias escrituras deben ser atómicas.

## Qué NO hacer

- No usar `require()` (es ESM).
- No instanciar `PrismaClient` más de una vez.
- No poner lógica de negocio en routers ni queries en controllers.
- No introducir `npm`/`yarn` lockfiles: solo `pnpm-lock.yaml`.
- No exponer secretos, hashes ni stack traces al cliente.