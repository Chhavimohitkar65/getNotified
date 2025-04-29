.PHONY: build run test clean docker-up docker-down deps migrate help

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOTEST=$(GOCMD) test
GOCLEAN=$(GOCMD) clean
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_NAME=notification-service
API_PATH=./cmd/api

all: deps build

help:
	@echo "Available commands:"
	@echo "  make build       - Build the notification service"
	@echo "  make run         - Run the notification service"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Clean build files"
	@echo "  make deps        - Download dependencies"
	@echo "  make migrate     - Run database migrations"
	@echo "  make docker-up   - Start Docker containers for development"
	@echo "  make docker-down - Stop Docker containers"

build:
	$(GOBUILD) -o $(BINARY_NAME) $(API_PATH)

run:
	$(GORUN) $(API_PATH)/main.go

test:
	$(GOTEST) -v ./...

clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

deps:
	$(GOMOD) download
	$(GOMOD) tidy

migrate:
	$(GORUN) $(API_PATH)/main.go --migrate-only

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
