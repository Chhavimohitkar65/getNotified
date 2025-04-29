# Notification System Backend Implementation

## Project Overview
A complete notification system with Go backend and React frontend:

- PostgreSQL database for storing templates and notifications
- Kafka for asynchronous message queuing
- Resend Email API integration for email delivery
- RESTful API endpoints with Gin framework
- React frontend with TypeScript and modern UI components

## Progress

### Completed
- Basic project structure setup
- Configuration management using Viper with YAML
- Logger implementation with Zap
- Database connection handler
- Kafka producer implementation
- Email service with Resend API integration
- Data models for templates and notifications
- Repository layer for database operations
- Service layer implementation (template service, notification service)
- API handlers implementation
- Middleware implementation
- Docker Compose setup for PostgreSQL and Kafka
- Makefile for common operations
- Comprehensive README with documentation
- Module imports and dependencies resolved

### Completed Tasks
- **Frontend Integration**: Connected the frontend to the backend API
- Implemented database migration system
- Built API authentication layer
- Implemented Kafka consumer for message processing
- Created all required frontend components:
  - NotificationSender for sending new notifications
  - NotificationLogs for viewing notification history
  - TemplateEditor for creating/editing notification templates
  - TemplateList for viewing all available templates
- Added proper error handling and validation
- Configured TypeScript interfaces for API integration
- Fixed TypeScript and linting errors in frontend code
- Implemented proper error handling in Kafka consumer

### Recently Fixed Issues
- Fixed 404 error when clicking on Send Notification in the sidebar (corrected URL from "/Send" to "/send")
- Fixed "Failed to create template" error by adding proper API key authentication
- Fixed CORS configuration to allow connections from the frontend (port 3000)
- Updated authentication middleware to support X-API-Key header format
- Ensured API keys match between frontend and backend
- Fixed "channel field missing" error in notification sender

### Latest Implementations
- Added user authentication system with JWT tokens
  - User registration and login endpoints
  - Secure password hashing with bcrypt
  - JWT token generation and validation
  - User profile management APIs
- Implemented user-specific notification channels management
  - Channel creation, retrieval, update, and deletion APIs
  - Support for different channel types (email, SMS, etc.)
  - Channel configuration storage in database
  - Default channel selection for each type
- Added database migrations for new features
  - User accounts table
  - User-specific channels table
  - Updated templates and notifications tables with user associations
- Enhanced authentication system
  - JWT middleware for protected routes
  - Backward compatibility with API key authentication
  - Frontend authentication client with token storage
- Applied proper authorization checks for API endpoints

### Remaining Tasks
- Add unit and integration tests
- Implement comprehensive logging and monitoring
- Add support for more notification channels (SMS, Push notifications)
- Create developer environment scripts
- Add CI/CD pipeline integration

### Frontend Integration Progress
- Created TypeScript API client (src/lib/api.ts) with proper interfaces
- Updated TemplateList component to fetch templates from backend API
- Updated TemplateEditor component to create/edit templates via API
- Implemented NotificationSender component for sending notifications
- Created NotificationLogs component to display notification history
- Added proper error handling and loading states to all components
- Implemented authentication token passing in API requests
- CORS configured on the backend to allow requests from the frontend
- Template and Notification interfaces aligned with backend models

## Next Steps for System Enhancement
1. Create API client in the frontend
2. Update TemplateList component to fetch data from backend
3. Update TemplateEditor component to save templates to backend
4. Implement notification sending through the backend
5. Create and connect notification logs component to backend data
6. Add authentication flow
7. Implement error handling and loading states in all components
8. Fix template creation and authentication issues
9. Ensure proper CORS configuration for frontend-backend communication
8. Add comprehensive test suite (unit, integration, e2e)
9. Implement SMS notification channel
10. Add support for push notifications
11. Create CI/CD pipeline for automatic deployment
12. Add API rate limiting
13. Implement user management and multi-tenant support

## Running the Application

### Backend
1. Copy the `.env.example` file to `.env` and fill in the required environment variables
2. Run `make docker-up` to start the database and Kafka services
3. Run `make run` to start the API server

### Frontend
1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Open http://localhost:3000 in your browser

### Environment Variables
The following environment variables are required:

```
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=notifications@yourdomain.com
RESEND_DOMAIN=yourdomain.com
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=getnotified
KAFKA_BROKERS=localhost:9092
AUTH_API_KEY=your-api-key
AUTH_SKIP_IN_DEVELOPMENT=true
```

### Database Migrations
Migrations are automatically run when the application starts. To run them manually:

```
make migrate
```

## Architecture
- **cmd/api**: Application entry point with main.go
- **internal/handlers**: API endpoint handlers
- **internal/middleware**: Authentication and logging middleware
- **internal/models**: Data models for the application
- **internal/repositories**: Database interaction logic
- **internal/services**: Business logic services
  - **consumer**: Notification processing services
- **pkg/email**: Email service implementation
- **pkg/database**: Database connection and migrations
- **pkg/kafka**: Kafka producer and consumer
- **pkg/logger**: Logging functionality

## Frontend Architecture
- **components**: Reusable UI components
  - **layout**: Layout components (Sidebar, Header, etc.)
  - **notifications**: Notification-related components
  - **templates**: Template-related components
  - **ui**: Generic UI components
- **lib**: Utility functions and API client
- **pages**: Application pages
- **styles**: CSS and styling

## Configuration
The backend uses a config.yaml file with the following structure:
- Server settings (port, environment)
- Database connection parameters
- Kafka configuration
- Email service settings (Resend API)

## API Endpoints (Connected to frontend)
- **Templates**: CRUD operations for notification templates
- **Notifications**: Send and retrieve notifications

## Frontend Integration
The frontend has been connected to the backend via API with the following components:
- API client with TypeScript interfaces for Templates and Notifications
- TemplateList component for viewing all templates
- TemplateEditor component for creating and editing templates
- NotificationSender component for sending notifications
- NotificationLogs component for viewing notification history

## Authentication
- JWT token-based authentication for user accounts
- API Key authentication for backward compatibility
- User registration with secure password hashing
- Environment variable configuration
- Support for development mode (skip authentication)

## Technical Details

### Database Schema
- Users table for storing user accounts and authentication
- Templates table for storing notification templates (with user association)
- Notifications table for storing notification history (with user association)
- Channels table for storing user-specific notification channel configurations

### API Key Authentication
In addition to JWT, the API also supports API key authentication that can be customized via the config file. Authentication can be skipped in development mode for easier testing.

Two API key authentication methods are supported:
1. **X-API-Key header**: `X-API-Key: your-api-key`
2. **Bearer token**: `Authorization: Bearer your-api-key`

The frontend uses the X-API-Key header method with the API key specified in the API client.

## Database Migrations
The system now includes a database migration system that uses SQL files to manage schema changes:
- Migration files are stored in the `migrations` directory
- Migration files follow the naming convention `VERSION_name.{up|down}.sql`
- Migrations are run automatically at startup or can be run manually

## Docker Setup
A docker-compose.yml file is provided for local development with:
- PostgreSQL database
- Zookeeper for Kafka
- Kafka broker
- Kafka UI for management

## Async Processing
The notification system includes a Kafka consumer for asynchronous processing:
- Notifications are queued in Kafka when created
- A consumer service picks up notifications and processes them
- Email sending is handled asynchronously
- Notification status is updated throughout the processing lifecycle