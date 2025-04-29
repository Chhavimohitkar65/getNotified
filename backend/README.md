# Notification System Backend

This is the backend service for the Notification System. It's a Go-based application with Kafka message queuing and PostgreSQL database for storing notification data.

## Features

- RESTful API built with Gin
- PostgreSQL database for persistence
- Kafka for async message processing
- Email notifications via Resend API
- Extensible for other notification channels (SMS, Push, WhatsApp)
- Clean architecture with clear separation of concerns

## Project Structure

```
backend/
├── cmd/
│   └── api/             # Application entry point
├── internal/
│   ├── config/          # Configuration management
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # HTTP middleware
│   ├── models/          # Data models
│   ├── repositories/    # Database operations
│   └── services/        # Business logic
├── pkg/
│   ├── database/        # Database connections
│   ├── email/           # Email service
│   ├── kafka/           # Kafka integration
│   └── logger/          # Logging utilities
├── scripts/             # Migration and utility scripts
├── config.yaml          # Configuration file
├── docker-compose.yml   # Docker Compose for dev environment
├── Makefile             # Build scripts
└── README.md            # This file
```

## Prerequisites

- Go 1.21 or later
- Docker and Docker Compose
- PostgreSQL
- Apache Kafka

## Getting Started

1. Clone the repository
2. Start the dependencies (PostgreSQL and Kafka):

```bash
make docker-up
```

3. Install the dependencies:

```bash
make deps
```

4. Build the application:

```bash
make build
```

5. Run the application:

```bash
make run
```

## API Endpoints

### Templates

- `GET /api/v1/templates` - List all templates
- `POST /api/v1/templates` - Create a new template
- `GET /api/v1/templates/:id` - Get template by ID
- `PUT /api/v1/templates/:id` - Update template
- `DELETE /api/v1/templates/:id` - Delete template

### Notifications

- `POST /api/v1/notifications` - Send notification
- `GET /api/v1/notifications` - List notifications
- `GET /api/v1/notifications/:id` - Get notification by ID

## Configuration

Configuration is loaded from the `config.yaml` file and can be overridden using environment variables. See `config.yaml` for available options.

## Frontend Integration

The frontend connects to this backend via the RESTful API. Make sure the frontend is configured to use the correct backend URL (default: http://localhost:8000).

## Development Commands

- `make build` - Build the notification service
- `make run` - Run the notification service
- `make test` - Run tests
- `make clean` - Clean build files
- `make deps` - Download dependencies
- `make migrate` - Run database migrations
- `make docker-up` - Start Docker containers for development
- `make docker-down` - Stop Docker containers

## Email Configuration

The system is configured to use Resend for email delivery. Update the API key and sender email in the config.yaml file.

```yaml
email:
  apikey: "your-resend-api-key"
  fromemail: "noreply@yourdomain.com"
  domain: "yourdomain.com"
  detailedlogs: true
```
