# Starwars API

API REST desarrollada con NestJS para gestionar información de películas de Star Wars. Incluye autenticación con JWT, gestión de usuarios y integración con MongoDB.

## 📋 Requisitos Previos

### Opción 1: Con Docker Desktop en Windows
- [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Git (opcional, para clonar el repositorio)

### Opción 2: Sin Docker Desktop (usando WSL)
- Windows 10/11 con WSL 2 habilitado
- Una distribución de Linux en WSL (recomendado: Ubuntu)
- Docker Engine instalado en WSL
- Git instalado en WSL

## 🚀 Instalación y Ejecución

### Opción 1: Con Docker Desktop en Windows

#### 1. Preparar el entorno

Primero, crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno:

```env
# MongoDB
MONGODB_URI=mongodb://mongodb:27017/starwars-db

# Server
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_aqui
JWT_EXPIRES_IN=1d

# External APIs
EXTERNAL_API_URL=https://www.swapi.tech/api

# Frontend URL
WEB_URL=http://localhost:5173
```

**Nota importante:** Si solo quieres ejecutar la API sin el frontend, modifica el archivo `docker-compose.yml` comentando o eliminando el servicio `web` (líneas 42-59).

#### 2. Construir y ejecutar los contenedores

Abre PowerShell o CMD en la carpeta del proyecto y ejecuta:

```bash
docker-compose up --build
```

Para ejecutar en segundo plano (modo detached):

```bash
docker-compose up -d --build
```

#### 3. Verificar que los servicios están corriendo

```bash
docker-compose ps
```

Deberías ver los siguientes contenedores activos:
- `starwars-mongodb` (puerto 27017)
- `starwars-api` (puerto 3000)
- `starwars-web` (puerto 5173) - solo si no lo comentaste

#### 4. Acceder a la API

- **API:** http://localhost:3000
- **Swagger Documentation:** http://localhost:3000/api/docs
- **Web:** http://localhost:5173 (si está habilitado)

#### 5. Ver logs

Para ver los logs de todos los servicios:
```bash
docker-compose logs -f
```

Para ver logs de un servicio específico:
```bash
docker-compose logs -f api
```

#### 6. Detener los servicios

```bash
docker-compose down
```

Para detener y eliminar también los volúmenes (borra la base de datos):
```bash
docker-compose down -v
```

---

### Opción 2: Sin Docker Desktop (usando WSL)

#### 1. Configurar WSL y Docker Engine

Si aún no tienes WSL configurado, abre PowerShell como administrador y ejecuta:

```powershell
wsl --install
```

Reinicia tu computadora si es necesario.

#### 2. Instalar Docker Engine en WSL

Abre tu terminal de WSL (Ubuntu u otra distribución) y ejecuta:

```bash
# Actualizar paquetes
sudo apt update
sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Agregar la clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar el repositorio
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar tu usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER

# Reiniciar para aplicar cambios de grupo
newgrp docker
```

#### 3. Iniciar el servicio de Docker

```bash
sudo service docker start
```

Para que Docker se inicie automáticamente cada vez que abras WSL, puedes agregar esto a tu `~/.bashrc` o `~/.zshrc`:

```bash
echo '# Start Docker daemon automatically' >> ~/.bashrc
echo 'if ! service docker status > /dev/null 2>&1; then' >> ~/.bashrc
echo '    sudo service docker start > /dev/null 2>&1' >> ~/.bashrc
echo 'fi' >> ~/.bashrc
```

**Nota:** Necesitarás permitir que Docker se ejecute sin contraseña. Ejecuta:

```bash
sudo visudo
```

Y agrega al final del archivo:
```
%docker ALL=(ALL) NOPASSWD: /usr/sbin/service docker start
```

#### 4. Navegar al proyecto

```bash
# Navegar a tu proyecto desde WSL
cd /mnt/c/Users/LeandroErnestoFráveg/Desktop/starwars-api
```

#### 5. Preparar el entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cat > .env << 'EOF'
# MongoDB
MONGODB_URI=mongodb://mongodb:27017/starwars-db

# Server
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_clave_secreta_jwt_aqui
JWT_EXPIRES_IN=1d

# External APIs
EXTERNAL_API_URL=https://www.swapi.tech/api

# Frontend URL
WEB_URL=http://localhost:5173
EOF
```

**Nota importante:** Si solo quieres ejecutar la API sin el frontend, modifica el archivo `docker-compose.yml` comentando o eliminando el servicio `web`.

#### 6. Construir y ejecutar los contenedores

```bash
docker compose up --build
```

Para ejecutar en segundo plano:
```bash
docker compose up -d --build
```

#### 7. Verificar que los servicios están corriendo

```bash
docker compose ps
```

#### 8. Acceder a la API

Desde Windows, abre tu navegador:
- **API:** http://localhost:3000
- **Swagger Documentation:** http://localhost:3000/api/docs
- **Web:** http://localhost:5173 (si está habilitado)

#### 9. Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f api
```

#### 10. Detener los servicios

```bash
docker compose down
```

Para eliminar también los volúmenes:
```bash
docker compose down -v
```

---

## 🛠️ Desarrollo Local (Sin Docker)

Si prefieres ejecutar el proyecto directamente en tu máquina sin Docker:

### 1. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### 2. Asegurarte de tener MongoDB instalado y corriendo

- **Windows:** Descarga e instala [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **WSL/Linux:** Sigue la [guía oficial de instalación](https://docs.mongodb.com/manual/administration/install-on-linux/)

### 3. Configurar variables de entorno

Crea un archivo `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/starwars-db
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_jwt_aqui
JWT_EXPIRES_IN=1d
EXTERNAL_API_URL=https://www.swapi.tech/api
WEB_URL=http://localhost:5173
```

### 4. Ejecutar en modo desarrollo

```bash
npm run start:dev
```

### 5. Ejecutar en modo producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

---

## 📚 Comandos Útiles

### Docker Desktop / WSL con Docker

```bash
# Ver contenedores activos
docker ps

# Ver todos los contenedores (incluso detenidos)
docker ps -a

# Detener un contenedor específico
docker stop starwars-api

# Iniciar un contenedor específico
docker start starwars-api

# Entrar a un contenedor
docker exec -it starwars-api sh

# Ver uso de recursos
docker stats

# Limpiar imágenes y contenedores no utilizados
docker system prune -a
```

### NPM (Desarrollo local)

```bash
# Ejecutar tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests e2e
npm run test:e2e

# Formatear código
npm run format

# Lint
npm run lint
```

---

## 🔍 Solución de Problemas

### Docker Desktop

**Problema:** "Docker daemon is not running"
- **Solución:** Asegúrate de que Docker Desktop esté abierto y en ejecución

**Problema:** El puerto 3000 ya está en uso
- **Solución:** Cambia el puerto en el archivo `.env` y en `docker-compose.yml`

**Problema:** Error de permisos al montar volúmenes
- **Solución:** En Docker Desktop, ve a Settings > Resources > File Sharing y asegúrate de que la carpeta del proyecto esté compartida

### WSL con Docker

**Problema:** "Cannot connect to the Docker daemon"
- **Solución:** Inicia el servicio de Docker con `sudo service docker start`

**Problema:** Permisos denegados al ejecutar comandos docker
- **Solución:** Asegúrate de estar en el grupo docker con `groups` y ejecuta `newgrp docker` si es necesario

**Problema:** Lentitud al acceder a archivos desde WSL en /mnt/c/
- **Solución:** Considera mover el proyecto a la carpeta home de WSL (~/) para mejor rendimiento

**Problema:** No se puede acceder a localhost desde Windows
- **Solución:** WSL 2 debería hacer forwarding automático de puertos. Si no funciona, prueba accediendo a la IP de WSL directamente (obtén la IP con `hostname -I` en WSL)

### MongoDB

**Problema:** Error de conexión a MongoDB
- **Solución:** Verifica que el contenedor de MongoDB esté corriendo con `docker compose ps` y que la URI en el `.env` sea correcta

**Problema:** Los datos no persisten
- **Solución:** Asegúrate de no usar `docker compose down -v` a menos que quieras borrar los datos

---

## 📖 Endpoints Principales

Una vez que la API esté corriendo, puedes acceder a la documentación completa de Swagger en:

http://localhost:3000/api/docs

Algunos endpoints principales:

- `POST /users/register` - Registrar nuevo usuario
- `POST /users/login` - Iniciar sesión
- `GET /starwars/films` - Obtener lista de películas
- `POST /starwars/films` - Crear nueva película (requiere autenticación)
- `PUT /starwars/films/:id` - Actualizar película (requiere autenticación)
- `DELETE /starwars/films/:id` - Eliminar película (requiere autenticación)

---

## 🤝 Contribuciones

Si encuentras algún problema o tienes sugerencias, no dudes en abrir un issue o pull request.

---

## 📄 Licencia

UNLICENSED
