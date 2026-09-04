.PHONY: help build up down restart destroy logs logs-api logs-worker logs-frontend ps \
        shell-api shell-worker shell-frontend redis-cli psql \
        api nest prisma migrate migrate-deploy migrate-reset studio generate \
        test test-e2e lint typecheck format \
        npm npm-build npm-lint init

# Colors
GREEN  := $(shell tput setaf 2)
YELLOW := $(shell tput setaf 3)
CYAN   := $(shell tput setaf 6)
RESET  := $(shell tput sgr0)

help: ## 🦫 Show help
	@echo ""
	@echo "${GREEN}🦫 Chiguicademy - Development Commands${RESET}"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  ${YELLOW}%-18s${RESET} %s\n", $$1, $$2}'
	@echo ""

# ===========================================
# DOCKER
# ===========================================

build: ## Build containers
	docker compose build --no-cache

up: ## Start all services
	docker compose up -d

down: ## Stop services
	docker compose down

restart: ## Restart services
	docker compose restart

destroy: ## Remove everything (containers, volumes, networks)
	docker compose down -v --remove-orphans

logs: ## Show logs for all services
	docker compose logs -f

logs-api: ## Show API logs
	docker compose logs -f api

logs-worker: ## Show worker logs
	docker compose logs -f worker

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

ps: ## Show container status
	docker compose ps

# ===========================================
# SHELL ACCESS
# ===========================================

shell-api: ## Open API shell
	docker compose exec api sh

shell-worker: ## Open worker shell
	docker compose exec worker sh

shell-frontend: ## Open frontend shell
	docker compose exec frontend sh

redis-cli: ## Open Redis CLI
	docker compose exec redis redis-cli

psql: ## Open PostgreSQL CLI
	docker compose exec postgres psql -U chiguicademy -d chiguicademy

# ===========================================
# API (NestJS)
# ===========================================

api: ## Run npm in the API container (usage: make api c="install axios")
	docker compose exec api npm $(c)

nest: ## Run Nest CLI (usage: make nest c="g module courses")
	docker compose exec api npx nest $(c)

prisma: ## Run Prisma CLI (usage: make prisma c="db pull")
	docker compose exec api npx prisma $(c)

generate: ## Regenerate Prisma client
	docker compose exec api npx prisma generate

migrate: ## Create and apply a migration from schema changes (usage: make migrate n="add_courses")
	docker compose exec api npx prisma migrate dev $(if $(n),--name $(n),)

migrate-deploy: ## Apply pending migrations without creating new ones (CI / prod)
	docker compose exec api npx prisma migrate deploy

migrate-reset: ## Drop the database and re-apply all migrations
	docker compose exec api npx prisma migrate reset --force

studio: ## Open Prisma Studio (http://localhost:5555)
	docker compose run --rm -p 5555:5555 api npx prisma studio --port 5555 --hostname 0.0.0.0

test: ## Run API unit tests
	docker compose exec api npm test

test-e2e: ## Run API e2e tests (needs running services)
	docker compose exec api npm run test:e2e

lint: ## Lint API
	docker compose exec api npm run lint

typecheck: ## Typecheck API
	docker compose exec api npm run typecheck

format: ## Format API sources
	docker compose exec api npm run format

# ===========================================
# NEXT.JS (Frontend)
# ===========================================

npm: ## Run npm in the frontend container (usage: make npm c="install axios")
	docker compose exec frontend npm $(c)

npm-build: ## Production build
	docker compose exec frontend npm run build

npm-lint: ## Run linter
	docker compose exec frontend npm run lint

# ===========================================
# SETUP INICIAL
# ===========================================

init: ## 🚀 Full initial setup (safe to rerun)
	@echo ""
	@echo "${GREEN}🦫 Starting Chiguicademy setup...${RESET}"
	@echo ""
	@echo "${CYAN}[1/4]${RESET} Preparing env files..."
	@test -f .env || cp .env.example .env
	@test -f api/.env || cp api/.env.example api/.env
	@test -f frontend/.env.local || cp frontend/.env.local.example frontend/.env.local
	@echo ""
	@echo "${CYAN}[2/4]${RESET} Building images..."
	@docker compose build
	@echo ""
	@echo "${CYAN}[3/4]${RESET} Starting services (waits for the API to be healthy)..."
	@docker compose up -d --wait api
	@docker compose up -d
	@echo ""
	@echo "${CYAN}[4/4]${RESET} Applying database migrations..."
	@docker compose exec api npx prisma migrate deploy
	@echo ""
	@echo "${GREEN}════════════════════════════════════════════════${RESET}"
	@echo "${GREEN}🦫 Chiguicademy is ready!${RESET}"
	@echo "${GREEN}════════════════════════════════════════════════${RESET}"
	@echo ""
	@echo "  ${CYAN}Frontend:${RESET}  http://localhost:3000"
	@echo "  ${CYAN}API:${RESET}       http://localhost:8080/api/health/ready"
	@echo "  ${CYAN}API Docs:${RESET}  http://localhost:8080/docs/api"
	@echo "  ${CYAN}Mailpit:${RESET}   http://localhost:8025"
	@echo "  ${CYAN}MinIO:${RESET}     http://localhost:9001"
	@echo ""
	@echo "  ${YELLOW}Useful commands:${RESET}"
	@echo "    make logs-api  - Show API logs"
	@echo "    make shell-api - Enter API container"
	@echo "    make nest c=\"g module courses\""
	@echo "    make migrate n=\"add_courses\""
	@echo ""
