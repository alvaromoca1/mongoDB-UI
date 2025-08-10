#!/bin/bash

# ========================================
# SCRIPT DE BACKUP AUTOMÁTICO
# MongoDB UI - Backup de Base de Datos
# ========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKUP_DIR="/var/backups/mongodb-ui"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo -e "${BLUE}💾 Iniciando backup de MongoDB UI...${NC}"

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está ejecutándose${NC}"
    exit 1
fi

# Verificar que el contenedor de MongoDB esté ejecutándose
if ! docker compose ps mongo | grep -q "Up"; then
    echo -e "${RED}❌ Contenedor de MongoDB no está ejecutándose${NC}"
    exit 1
fi

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Directorio de backup: $BACKUP_DIR${NC}"

# Crear backup
echo -e "${BLUE}📦 Creando backup...${NC}"
BACKUP_NAME="mongodb_backup_$DATE"
docker compose exec -T mongo mongodump --out "/backup/$BACKUP_NAME" --gzip

# Copiar backup al host
echo -e "${BLUE}📋 Copiando backup al host...${NC}"
docker compose exec mongo tar -czf "/backup/$BACKUP_NAME.tar.gz" -C "/backup" "$BACKUP_NAME"
docker cp "$(docker compose ps -q mongo):/backup/$BACKUP_NAME.tar.gz" "$BACKUP_DIR/"

# Limpiar archivos temporales del contenedor
docker compose exec mongo rm -rf "/backup/$BACKUP_NAME" "/backup/$BACKUP_NAME.tar.gz"

# Verificar que el backup se creó correctamente
if [ -f "$BACKUP_DIR/$BACKUP_NAME.tar.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
    echo -e "${GREEN}✅ Backup creado exitosamente: $BACKUP_NAME.tar.gz ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Error al crear el backup${NC}"
    exit 1
fi

# Limpiar backups antiguos
echo -e "${BLUE}🧹 Limpiando backups antiguos (más de $RETENTION_DAYS días)...${NC}"
find "$BACKUP_DIR" -name "mongodb_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Mostrar backups disponibles
echo -e "${BLUE}📋 Backups disponibles:${NC}"
ls -lh "$BACKUP_DIR"/mongodb_backup_*.tar.gz 2>/dev/null || echo "No hay backups disponibles"

echo -e "${GREEN}🎉 Backup completado exitosamente!${NC}"
