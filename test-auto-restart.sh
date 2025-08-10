#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Probando Auto-Restart de Contenedores${NC}"
echo "=========================================="

# 1. Iniciar contenedores
echo -e "\n${YELLOW}1. Iniciando contenedores...${NC}"
docker compose up -d

# Esperar a que estén listos
echo -e "${YELLOW}   Esperando que los contenedores estén listos...${NC}"
sleep 10

# 2. Verificar estado inicial
echo -e "\n${YELLOW}2. Estado inicial de contenedores:${NC}"
docker compose ps

# 3. Simular reinicio de Docker (matar contenedores)
echo -e "\n${YELLOW}3. Simulando reinicio de Docker (matando contenedores)...${NC}"
docker compose kill

# Esperar un momento
sleep 5

# 4. Verificar que se reiniciaron automáticamente
echo -e "\n${YELLOW}4. Verificando auto-restart...${NC}"
sleep 10
docker compose ps

# 5. Verificar logs de reinicio
echo -e "\n${YELLOW}5. Logs de reinicio:${NC}"
docker compose logs --tail=5

# 6. Verificar conectividad
echo -e "\n${YELLOW}6. Probando conectividad...${NC}"
if curl -f http://localhost:9000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API respondiendo correctamente${NC}"
else
    echo -e "${RED}❌ API no responde${NC}"
fi

if curl -f http://localhost:9001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend respondiendo correctamente${NC}"
else
    echo -e "${RED}❌ Frontend no responde${NC}"
fi

echo -e "\n${GREEN}🎉 Prueba de auto-restart completada${NC}"
echo -e "${BLUE}Los contenedores deberían haberse reiniciado automáticamente${NC}"
