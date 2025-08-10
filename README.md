# 🚀 **MongoDB UI - Gestor Visual de Bases de Datos MongoDB**

## 📋 **Descripción del Proyecto**

**MongoDB UI** es una aplicación web moderna y profesional para gestionar bases de datos MongoDB de manera visual e intuitiva. Proporciona una interfaz gráfica completa que permite explorar, consultar y administrar bases de datos MongoDB sin necesidad de comandos de terminal.

## 🎯 **Objetivos del Proyecto**

- ✅ **Gestión Visual**: Interfaz gráfica para administrar MongoDB
- ✅ **Exploración Intuitiva**: Navegación fácil entre bases de datos y colecciones
- ✅ **Query Builder**: Constructor visual de consultas con ejemplos
- ✅ **Temas Personalizables**: Modo claro, oscuro y automático
- ✅ **Persistencia de Datos**: Las bases de datos se mantienen entre reinicios
- ✅ **Acceso Remoto**: Accesible desde cualquier dispositivo en la red
- ✅ **Docker Ready**: Despliegue simplificado con contenedores

## 🏗️ **Arquitectura del Proyecto**

```
mongoDB-UI/
├── apps/
│   ├── api/                 # Backend NestJS + Fastify
│   │   ├── src/
│   │   │   ├── modules/     # Módulos de la aplicación
│   │   │   ├── routes/      # Rutas de la API
│   │   │   └── services/    # Servicios de negocio
│   │   └── Dockerfile       # Contenedor del backend
│   └── web/                 # Frontend React + Vite
│       ├── src/
│       │   ├── components/  # Componentes React
│       │   ├── pages/       # Páginas de la aplicación
│       │   └── contexts/    # Contextos de React
│       └── Dockerfile       # Contenedor del frontend
├── docker-compose.yml       # Configuración de producción
├── docker-compose.dev.yml   # Configuración de desarrollo
└── README.md               # Este archivo
```

## 🚀 **Características Principales**

### 🔐 **Gestión de Conexiones**
- Crear y gestionar múltiples conexiones MongoDB
- Conexión automática a `exampledb` con datos de ejemplo
- Validación de conexiones en tiempo real

### 🗄️ **Exploración de Datos**
- Listado de todas las bases de datos disponibles
- Navegación por colecciones con diferenciación visual
- Visualización de documentos en formato tabla
- Información de tamaño y estadísticas

### 🔍 **Query Builder**
- Constructor visual de consultas JSON
- Ejemplos predefinidos para consultas comunes
- Límite configurable de resultados
- Ejecución en tiempo real

### 🎨 **Interfaz Moderna**
- **Temas**: Claro, oscuro y automático
- **Diseño Glassmorphism**: Efectos visuales modernos
- **Responsive**: Funciona en todos los dispositivos
- **Animaciones**: Transiciones suaves

### 🔧 **Funcionalidades Avanzadas**
- Creación de nuevas colecciones
- Persistencia de sesiones
- Hot reload en desarrollo
- Logs detallados

## 🛠️ **Tecnologías Utilizadas**

### **Backend**
- **NestJS**: Framework de Node.js
- **Fastify**: Servidor web de alto rendimiento
- **MongoDB Driver**: Cliente oficial de MongoDB
- **JWT**: Autenticación con tokens

### **Frontend**
- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático
- **Vite**: Herramienta de construcción
- **Tailwind CSS**: Framework de estilos
- **Axios**: Cliente HTTP

### **Infraestructura**
- **Docker**: Contenedores para despliegue
- **Docker Compose**: Orquestación de servicios
- **MongoDB**: Base de datos principal
- **Nginx**: Servidor web para el frontend

## 📦 **Instalación y Despliegue**

### **Prerrequisitos**
- Docker y Docker Compose instalados
- Git para clonar el repositorio
- Acceso a internet para descargar imágenes
- Puertos 9010, 9011 y 9012 disponibles

### **1. Clonar el Repositorio**
```bash
git clone <url-del-repositorio>
cd mongoDB-UI
```

### **2. Configurar Variables de Entorno**
```bash
cp env.example .env
# Editar .env según tus necesidades
```

### **3. Iniciar la Aplicación**
```bash
# Iniciar todos los servicios
docker compose up -d

# O usar el Makefile
make docker-prod
```

### **4. Acceder a la Aplicación**
- **Frontend**: http://localhost:9011
- **API**: http://localhost:9010
- **MongoDB**: localhost:9012

### **5. Auto-Restart**
Los contenedores se reiniciarán automáticamente al arrancar el sistema si Docker está configurado para auto-inicio.

## 🔧 **Configuración para Múltiples Proyectos**

### **Puertos Únicos**
Este proyecto está configurado para evitar conflictos con otros proyectos:

- **API**: Puerto 9010 (evita conflictos con puertos estándar)
- **Frontend**: Puerto 9011 (evita conflictos con puertos estándar)
- **MongoDB**: Puerto 9012 (evita conflictos con MongoDB estándar)

### **Nombres Únicos**
- **Contenedores**: `mongodb-ui-api`, `mongodb-ui-web`, `mongodb-ui-mongo`
- **Volúmenes**: `mongodb-ui_mongo_data`, `mongodb-ui_api_data`
- **Red**: `mongodb-ui_appnet`

### **Variables de Entorno**
Todas las variables están prefijadas para evitar conflictos con otros proyectos.



## 🌐 **Configuración para Acceso Remoto**

### **Acceso desde la Red Local**
Para permitir acceso desde otros dispositivos en la misma red:

1. **Modificar el archivo `.env`**:
```env
HOST=0.0.0.0
FRONTEND_PORT=5111
API_PORT=4000
MONGO_PORT=27017
```

2. **Actualizar `docker-compose.yml`**:
```yaml
services:
  web:
    ports:
      - "0.0.0.0:5111:80"  # Acceso desde cualquier IP
  
  api:
    ports:
      - "0.0.0.0:4000:4000"  # API accesible desde red
  
  mongo:
    ports:
      - "0.0.0.0:27017:27017"  # MongoDB accesible desde red
```

3. **Reiniciar servicios**:
```bash
docker compose down
docker compose up -d
```

### **Acceso desde Otros Proyectos Docker**
Para conectar desde otros contenedores en la misma máquina:

```yaml
# En otros docker-compose.yml
services:
  mi-app:
    environment:
      - MONGO_URI=mongodb://mongo:27017
    networks:
      - appnet  # Misma red que MongoDB UI
```

## 🔄 **Auto-Restart de Contenedores**

Los contenedores están configurados con `restart: unless-stopped`, lo que significa que:

✅ **Se reinician automáticamente cuando:**
- El sistema se reinicia
- Docker se reinicia
- Los contenedores se caen por error
- Hay problemas de red temporales

❌ **NO se reinician cuando:**
- Ejecutas `docker-compose down` manualmente
- Detienes contenedores con `docker stop`

### **Configuración de Auto-Inicio**

Si Docker ya está configurado para auto-inicio en tu sistema, los contenedores se reiniciarán automáticamente al arrancar la computadora.

## 📊 **Persistencia de Datos**

### **Volúmenes Docker**
Los datos se mantienen en volúmenes persistentes:

```yaml
volumes:
  mongo_data:    # Datos de MongoDB
  mongo_config:  # Configuración de MongoDB
  api_logs:      # Logs del backend
```

### **Ubicación de Datos**
- **MongoDB**: `/var/lib/docker/volumes/mongodb-ui_mongo_data`
- **Logs**: `/var/lib/docker/volumes/mongodb-ui_api_logs`

## 🔧 **Comandos Disponibles**

### **🚀 Comandos Principales (Makefile)**

#### **Gestión de Contenedores**
```bash
# Iniciar contenedores de producción
make docker-prod
# o
docker compose up -d

# Iniciar contenedores de desarrollo (con hot reload)
make docker-dev
# o
docker compose -f docker-compose.dev.yml up -d

# Detener contenedores de producción
make docker-prod-down
# o
docker compose down

# Detener contenedores de desarrollo
make docker-dev-down
# o
docker compose -f docker-compose.dev.yml down

# Iniciar con rebuild (reconstruir imágenes)
make docker-up
# o
docker compose up -d --build

# Detener y limpiar volúmenes
make docker-down
# o
docker compose down -v
```

#### **Desarrollo Local**
```bash
# Ejecutar en modo desarrollo (sin Docker)
make dev
# o
pnpm dev

# Construir aplicación
make build
# o
pnpm build

# Iniciar aplicación construida
make start
# o
pnpm start

# Ejecutar tests
make test
# o
pnpm test

# Ejecutar tests end-to-end
make e2e
# o
pnpm e2e
```

#### **Gestión de Base de Datos**
```bash
# Inicializar base de datos exampledb con datos de ejemplo
make init-db
# o
docker compose exec mongo mongosh --file /docker-entrypoint-initdb.d/init-mongo.js

# Crear backup de MongoDB
make backup
# o
./backup-mongodb.sh

# Restaurar backup de MongoDB
make restore
# o
./restore-mongodb.sh
```

#### **Monitoreo y Mantenimiento**
```bash
# Ver estado de contenedores
make status
# o
docker compose ps

# Ver logs en tiempo real
make logs
# o
docker compose logs -f

# Probar auto-restart de contenedores
make test-restart
# o
./test-auto-restart.sh

# Limpiar contenedores y volúmenes
make clean
# o
docker compose down -v && docker system prune -f

# Mostrar ayuda con todos los comandos
make help
```

### **🐳 Comandos Docker Directos**

#### **Gestión de Contenedores**
```bash
# Ver contenedores ejecutándose
docker compose ps

# Ver todos los contenedores (incluyendo detenidos)
docker compose ps -a

# Reiniciar todos los servicios
docker compose restart

# Reiniciar un servicio específico
docker compose restart api
docker compose restart web
docker compose restart mongo

# Forzar recreación de contenedores
docker compose up -d --force-recreate

# Reconstruir imágenes
docker compose build --no-cache
```

#### **Logs y Debugging**
```bash
# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs api
docker compose logs web
docker compose logs mongo

# Ver logs con timestamps
docker compose logs -t

# Ver últimas N líneas de logs
docker compose logs --tail=50

# Ver logs desde un tiempo específico
docker compose logs --since="2024-01-01T00:00:00"
```

#### **Acceso a Contenedores**
```bash
# Acceder al shell de MongoDB
docker compose exec mongo mongosh

# Acceder al shell del API
docker compose exec api sh

# Acceder al shell del frontend
docker compose exec web sh

# Ejecutar comando específico en contenedor
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
docker compose exec api node --version
```

#### **Gestión de Volúmenes**
```bash
# Listar volúmenes
docker volume ls

# Ver información de un volumen
docker volume inspect mongodb-ui_mongo_data

# Eliminar volúmenes no utilizados
docker volume prune

# Backup manual de volumen
docker run --rm -v mongodb-ui_mongo_data:/data -v $(pwd):/backup alpine tar czf /backup/mongo_backup.tar.gz -C /data .
```

#### **Gestión de Redes**
```bash
# Listar redes
docker network ls

# Ver información de red
docker network inspect mongodb-ui_appnet

# Conectar contenedor a red
docker network connect mongodb-ui_appnet mi_contenedor
```

### **🔍 Comandos de Diagnóstico**

#### **Verificar Conectividad**
```bash
# Probar API
curl -f http://localhost:9010/health

# Probar Frontend
curl -f http://localhost:9011

# Probar MongoDB
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"

# Verificar puertos en uso
sudo lsof -i :9010
sudo lsof -i :9011
sudo lsof -i :9012
```

#### **Información del Sistema**
```bash
# Ver recursos utilizados por Docker
docker system df

# Ver estadísticas de contenedores
docker stats

# Ver información del sistema Docker
docker info

# Ver versiones
docker --version
docker compose version
```

### **🧹 Comandos de Limpieza**

#### **Limpieza de Contenedores**
```bash
# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volúmenes
docker compose down -v

# Eliminar contenedores no utilizados
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Limpieza completa del sistema Docker
docker system prune -a
```

#### **Limpieza de Datos**
```bash
# Eliminar volúmenes de datos (¡CUIDADO!)
docker compose down -v

# Eliminar volúmenes específicos
docker volume rm mongodb-ui_mongo_data mongodb-ui_api_data

# Resetear base de datos
docker compose down -v
docker compose up -d
make init-db
```

### **📊 Comandos de Monitoreo**

#### **Estado de Servicios**
```bash
# Ver estado de todos los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Monitorear recursos
docker stats

# Verificar health checks
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
```

#### **Métricas de Rendimiento**
```bash
# Ver uso de CPU y memoria
docker stats --no-stream

# Ver uso de disco
docker system df

# Ver logs de errores
docker compose logs --tail=100 | grep -i error
```

### **🔄 Comandos de Auto-Restart**

#### **Prueba de Auto-Restart**
```bash
# Probar que los contenedores se reinician automáticamente
make test-restart

# Simular reinicio manual
docker compose kill
# Esperar unos segundos y verificar que se reiniciaron
docker compose ps
```

#### **Configuración de Reinicio**
```bash
# Ver política de reinicio actual
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.RestartPolicy}}"

# Cambiar política de reinicio (editar docker-compose.yml)
# restart: unless-stopped  # Se reinicia automáticamente
# restart: always         # Siempre se reinicia
# restart: no            # No se reinicia automáticamente
```

## 🔒 **Seguridad**

### **Configuración Recomendada**
- Cambiar `JWT_SECRET` por un valor seguro
- Usar HTTPS en producción
- Configurar firewall para puertos expuestos
- Limitar acceso a MongoDB desde red local

### **Variables de Entorno Críticas**
```env
JWT_SECRET=tu_jwt_secret_super_seguro_aqui  # ¡OBLIGATORIO!
NODE_ENV=production                         # Para producción
```

## 📈 **Monitoreo y Logs**

### **Ver Logs en Tiempo Real**
```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f api
docker compose logs -f web
docker compose logs -f mongo
```

### **Métricas de Rendimiento**
- **API**: Endpoint `/health` para verificar estado
- **MongoDB**: Estadísticas en logs del contenedor
- **Frontend**: Logs del navegador para debugging

## 🐛 **Solución de Problemas**

### **Problemas Comunes**

1. **Puertos en Uso**:
```bash
sudo lsof -i :9010  # Verificar puerto API
sudo lsof -i :9011  # Verificar puerto Frontend
sudo lsof -i :9012  # Verificar puerto MongoDB
```

2. **Contenedores No Inician**:
```bash
docker compose logs  # Ver logs de error
docker system prune  # Limpiar recursos no usados
```

3. **MongoDB No Conecta**:
```bash
docker compose exec mongo mongosh  # Conectar directamente
docker compose restart mongo       # Reiniciar MongoDB
```

4. **Persistencia de Datos**:
```bash
docker volume ls                    # Listar volúmenes
docker volume inspect mongo_data    # Verificar volumen
```

## 📚 **Características Principales**

- ✅ **Sistema de Temas**: Claro, oscuro y automático
- ✅ **Indicador de Conexión**: Visual con iconos y estado
- ✅ **Query Builder**: Constructor visual con ejemplos
- ✅ **Persistencia de Datos**: Las bases de datos se mantienen entre reinicios
- ✅ **Acceso Remoto**: Accesible desde cualquier dispositivo en la red
- ✅ **Auto-Inicio**: Configuración automática para servidor Debian

## 🤝 **Contribución**

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 **Soporte**

- **Issues**: Crear issue en GitHub
- **Documentación**: Revisar archivos README
- **Logs**: Verificar logs de Docker

---

**¡Disfruta explorando tus bases de datos MongoDB con esta interfaz moderna y profesional!** 🎉
