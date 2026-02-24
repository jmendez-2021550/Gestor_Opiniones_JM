# Gestor de Opiniones

## ¿Qué es este proyecto?

Es una aplicación web para compartir opiniones y frases importantes. Los usuarios pueden crear una cuenta, publicar sus opiniones, comentar en las opiniones de otros, dar "me gusta" y agregar favoritos.

## ¿Qué necesito para que funcione?

Antes de empezar, necesitas tener instalado en tu computadora:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes, es más rápido que npm)
- **PostgreSQL** (base de datos principal)
- **MongoDB** (para guardar algunas características)
- **Docker** (opcional, pero recomendado para ejecutar PostgreSQL fácilmente)

## Pasos para hacer funcionar el proyecto

### Paso 1: Clonar o descargar el proyecto

Descarga el proyecto a tu computadora. Una vez que lo tengas, abre una terminal en la carpeta del proyecto.

### Paso 2: Instalar las dependencias

En la terminal, escribe:

```bash
pnpm install
```

Esto descargará todas las librerías que necesita el proyecto.

### Paso 3: Configurar las variables de entorno

Necesitas un archivo llamado `.env` en la raíz del proyecto. Este archivo tiene información importante como contraseñas y configuraciones. Ya debe estar incluido en el proyecto, pero verifica que tenga estas configuraciones:

```
NODE_ENV=development
PORT=3005

DB_HOST=localhost
DB_PORT=5436
DB_NAME=OPINIONS_MANAGER_DB
DB_USERNAME=root
DB_PASSWORD=admin

URI_MONGO=mongodb://localhost:27017/gestor_opiniones

JWT_SECRET=MyVerySecretKeyForJWTTokenAuthenticationWith256Bits!
JWT_EXPIRES_IN=30m

FRONTEND_URL=http://localhost:5173
```

**Nota:** Si quieres cambiar alguno de estos valores (como la contraseña o el puerto), puedes editar el archivo `.env`.

### Paso 4: Configurar la base de datos PostgreSQL

Tienes dos opciones:

**Opción A: Usar Docker (recomendado, más fácil)**

1. Asegúrate de tener Docker instalado
2. En la terminal, accede a la carpeta del proyecto
3. Ejecuta:

```bash
docker-compose up -d
```

Esto creará un contenedor con PostgreSQL automáticamente.

**Opción B: Instalar PostgreSQL en tu computadora**

1. Descarga PostgreSQL desde https://www.postgresql.org/download/
2. Durante la instalación, recuerda la contraseña que pongas
3. Crea una base de datos llamada `OPINIONS_MANAGER_DB`
4. Actualiza los valores en el archivo `.env` con tus datos

### Paso 5: Configurar MongoDB (opcional pero recomendado)

MongoDB se usa para guardar información adicional. Puedes:

- **Instalar mongoDB localmente** desde https://www.mongodb.com/try/download/community
- **O usar MongoDB Atlas** (cloud gratuito): https://www.mongodb.com/cloud/atlas

Si usas Atlas, actualiza el valor de `URI_MONGO` en el archivo `.env` con tu conexión.

### Paso 6: Iniciar el servidor

En la terminal, ejecuta:

```bash
pnpm dev
```

Debe aparecer un mensaje como este:

```
Gestor de Opiniones API Server running on port 3005
Health check: http://localhost:3005/api/v1/health
```

¡Listo! El servidor está funcionando.

## Rutas principales de la API

### Autenticación
- `POST /api/v1/auth/register` - Crear una nueva cuenta
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/verify-email` - Verificar correo electrónico
- `POST /api/v1/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/v1/auth/reset-password` - Cambiar contraseña

### Opiniones
- `GET /api/v1/opinions` - Ver todas las opiniones públicas
- `POST /api/v1/opinions` - Crear una nueva opinión (requiere estar logueado)
- `GET /api/v1/opinions/:id` - Ver una opinión específica
- `PUT /api/v1/opinions/:id` - Editar tu opinión
- `DELETE /api/v1/opinions/:id` - Eliminar tu opinión

## Dudas o problemas

Si algo no funciona:

1. Verifica que PostgreSQL esté funcionando
2. Verifica que MongoDB esté funcionando
3. Revisa que el puerto 3005 no esté siendo usado por otra aplicación
4. Revisa que los datos en el archivo `.env` sean correctos

¡Eso es todo! Ya puedes empezar a desarrollar o usar la aplicación.
