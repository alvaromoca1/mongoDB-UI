#!/bin/bash

# ========================================
# SCRIPT DE RESTAURACIÓN
# MongoDB UI - Restaurar Base de Datos
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

echo -e "${BLUE}🔄 Script de restauración de MongoDB UI${NC}"

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

# Verificar que existe el directorio de backups
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Directorio de backups no encontrado: $BACKUP_DIR${NC}"
    exit 1
fi

# Listar backups disponibles
echo -e "${BLUE}📋 Backups disponibles:${NC}"
BACKUPS=($(ls "$BACKUP_DIR"/mongodb_backup_*.tar.gz 2>/dev/null | sort -r))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No hay backups disponibles${NC}"
    exit 1
fi

for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE=$(basename "${BACKUPS[$i]}")
    BACKUP_DATE=$(echo "$BACKUP_FILE" | sed 's/mongodb_backup_\(.*\)\.tar\.gz/\1/')
    BACKUP_SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
    echo "  $((i+1)). $BACKUP_FILE ($BACKUP_SIZE) - $BACKUP_DATE"
done

# Seleccionar backup
echo ""
read -p "Selecciona el número del backup a restaurar (1-${#BACKUPS[@]}): " SELECTION

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
    echo -e "${RED}❌ Selección inválida${NC}"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
BACKUP_FILE=$(basename "$SELECTED_BACKUP")

echo -e "${YELLOW}⚠️  ¿Estás seguro de que quieres restaurar $BACKUP_FILE?${NC}"
echo -e "${YELLOW}⚠️  Esto sobrescribirá todos los datos actuales de MongoDB.${NC}"
read -p "Escribe 'SI' para confirmar: " CONFIRMATION

if [ "$CONFIRMATION" != "SI" ]; then
    echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    exit 0
fi

# Crear backup de seguridad antes de restaurar
echo -e "${BLUE}💾 Creando backup de seguridad antes de restaurar...${NC}"
./backup-mongodb.sh

# Extraer backup
echo -e "${BLUE}📦 Extrayendo backup...${NC}"
RESTORE_DIR="/tmp/mongodb_restore_$$"
mkdir -p "$RESTORE_DIR"
tar -xzf "$SELECTED_BACKUP" -C "$RESTORE_DIR"

# Encontrar el directorio de datos
DATA_DIR=$(find "$RESTORE_DIR" -name "*.bson" -exec dirname {} \; | head -1 | xargs dirname)

if [ -z "$DATA_DIR" ]; then
    echo -e "${RED}❌ No se encontraron datos válidos en el backup${NC}"
    rm -rf "$RESTORE_DIR"
    exit 1
fi

# Copiar datos al contenedor
echo -e "${BLUE}📋 Copiando datos al contenedor...${NC}"
docker cp "$DATA_DIR" "$(docker compose ps -q mongo):/backup/restore_data"

# Restaurar datos
echo -e "${BLUE}🔄 Restaurando datos...${NC}"
docker compose exec mongo mongorestore --drop --gzip /backup/restore_data

# Limpiar archivos temporales
echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
docker compose exec mongo rm -rf /backup/restore_data
rm -rf "$RESTORE_DIR"

echo -e "${GREEN}✅ Restauración completada exitosamente!${NC}"
echo -e "${BLUE}🌐 La aplicación está disponible en: http://localhost:5111${NC}"
