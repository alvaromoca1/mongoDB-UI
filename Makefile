SHELL := /bin/bash

.PHONY: dev build start docker-up docker-down docker-dev docker-dev-down test e2e prepare setup-debian backup restore logs status clean help

prepare:
	pnpm install
	pnpm exec husky install

dev:
	pnpm dev

build:
	pnpm build

start:
	pnpm start

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

docker-prod:
	docker compose up -d

docker-prod-down:
	docker compose down

docker-dev:
	docker compose -f docker-compose.dev.yml up -d --build

docker-dev-down:
	docker compose -f docker-compose.dev.yml down -v

init-db:
	@echo "🚀 Inicializando base de datos exampledb..."
	@docker compose exec mongo mongosh --file /docker-entrypoint-initdb.d/init-mongo.js
	@echo "✅ Base de datos inicializada correctamente!"

test:
	pnpm test

e2e:
	pnpm e2e



backup:
	./backup-mongodb.sh

restore:
	./restore-mongodb.sh

test-restart:
	@echo "🧪 Probando auto-restart..."
	@chmod +x test-auto-restart.sh && ./test-auto-restart.sh

logs:
	docker compose logs -f

status:
	docker compose ps

clean:
	docker compose down -v
	docker system prune -f

help:
	@echo "Comandos disponibles:"
	@echo "  dev             - Ejecutar en modo desarrollo"
	@echo "  build           - Construir aplicación"
	@echo "  start           - Iniciar aplicación"
	@echo "  docker-up       - Iniciar contenedores con build"
	@echo "  docker-down     - Detener contenedores y limpiar volúmenes"
	@echo "  docker-prod     - Iniciar contenedores de producción"
	@echo "  docker-prod-down- Detener contenedores de producción"
	@echo "  docker-dev      - Iniciar contenedores de desarrollo"
	@echo "  docker-dev-down - Detener contenedores de desarrollo"
	@echo "  init-db         - Inicializar base de datos"
	@echo "  test            - Ejecutar tests"
	@echo "  e2e             - Ejecutar tests end-to-end"

	@echo "  backup          - Crear backup de MongoDB"
	@echo "  restore         - Restaurar backup de MongoDB"
	@echo "  test-restart    - Probar auto-restart de contenedores"
	@echo "  logs            - Ver logs de contenedores"
	@echo "  status          - Ver estado de contenedores"
	@echo "  clean           - Limpiar contenedores y volúmenes"
	@echo "  help            - Mostrar esta ayuda"


