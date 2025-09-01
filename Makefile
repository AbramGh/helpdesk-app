.PHONY: help dev build test clean docker-up docker-down setup

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial project setup
	@echo "Setting up helpdesk project..."
	@cp .env.example .env
	@pnpm install
	@echo "Setup complete! Run 'make dev' to start development."

dev: ## Start development environment
	@echo "Starting development environment..."
	@docker-compose -f infra/docker/docker-compose.yml up -d postgres redis minio mailhog
	@sleep 5
	@pnpm dev

build: ## Build all applications
	@echo "Building applications..."
	@pnpm build

test: ## Run all tests
	@echo "Running tests..."
	@pnpm test

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@pnpm clean

docker-up: ## Start all services with Docker
	@echo "Starting all services..."
	@docker-compose -f infra/docker/docker-compose.yml up -d

docker-down: ## Stop all services
	@echo "Stopping all services..."
	@docker-compose -f infra/docker/docker-compose.yml down

docker-logs: ## View logs from all services
	@docker-compose -f infra/docker/docker-compose.yml logs -f

reset-db: ## Reset database (WARNING: destroys all data)
	@echo "Resetting database..."
	@docker-compose -f infra/docker/docker-compose.yml down -v postgres
	@docker-compose -f infra/docker/docker-compose.yml up -d postgres
