# GetNotified - Modern Notification System

GetNotified is a robust notification system built with Go (backend) and React (frontend). It allows you to create notification templates, send personalized notifications to users, and track delivery status.

## Features

- **Template Management**: Create, edit, and manage reusable notification templates
- **Rich Template Variables**: Use JSON variables to personalize your notifications
- **Multiple Channels**: Send notifications via email (SMS and push coming soon)
- **Asynchronous Processing**: Notifications are processed in the background using Kafka
- **Delivery Tracking**: Monitor notification status (queued, sent, delivered, failed)
- **User-friendly UI**: Modern React-based interface with real-time feedback
- **API Authentication**: Secure your API with API key authentication

## Running the Notification System

To run the complete notification system, you'll need to start both the backend (Go) and frontend (React) components, along with the required dependencies (PostgreSQL and Kafka). Here's how to do it:

### Step 1: Start the Database and Kafka (Backend Dependencies)

First, start the Docker containers for PostgreSQL and Kafka:

```bash
cd backend
make docker-up
```

This command will start the following services:

- PostgreSQL database
- Zookeeper (required for Kafka)
- Kafka broker
- Kafka UI (accessible at http://localhost:8080)

Wait for a few moments until all services are up and running.

### Step 2: Run the Backend

Once the dependencies are running, you can start the backend server:

```bash
cd backend
make run
```

This will:

1. Build the Go application
2. Apply any database migrations
3. Start the API server (default port: 8000)

You should see log output indicating that the server is running.

### Step 3: Run the Frontend

Open a new terminal window to run the frontend application:

```bash
cd frontend
npm install  # Only needed the first time or after package changes
npm run dev
```

The frontend development server will start and should be accessible at http://localhost:3000 (or another port if specified).

### Step 4: Access the Application

Once both services are running:

1. Open your browser and navigate to the frontend URL (likely http://localhost:3000)
2. You should see the notification system interface
3. The backend API will be available at http://localhost:8000

## Testing the System

To test the notification system:

1. Create a template using the Template Editor
2. Send a notification using the Send Notification page
3. View notification delivery status in the Logs page

## Stopping the System

When you're done:

1. Stop the frontend with Ctrl+C in its terminal
2. Stop the backend with Ctrl+C in its terminal
3. Stop the Docker containers with:
   ```bash
   cd backend
   make docker-down
   ```

## Troubleshooting

If you encounter any issues:

1. **Database Connectivity**: Check that the PostgreSQL container is running (`docker ps`)
2. **Kafka Issues**: Check the Kafka UI at http://localhost:8080 to verify topics and messages
3. **API Connectivity**: Ensure the backend is running and check logs for error messages
4. **Frontend Issues**: Check for console errors in your browser's developer tools

## Environment Variables

The following environment variables are required:

```env
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

## Architecture

### Backend

- **cmd/api**: Application entry point with main.go
- **internal/handlers**: API endpoint handlers
- **internal/middleware**: Authentication and logging middleware
- **internal/models**: Data models for the application
- **internal/repositories**: Database interaction logic
- **internal/services**: Business logic services
- **pkg/email**: Email service implementation
- **pkg/database**: Database connection and migrations
- **pkg/kafka**: Kafka producer and consumer

### Frontend

- **components**: Reusable UI components
  - **layout**: Layout components (Sidebar, Header, etc.)
  - **notifications**: Notification-related components
  - **templates**: Template-related components
  - **ui**: Generic UI components
- **lib**: Utility functions and API client
- **pages**: Application pages

Would you like me to explain any specific part of the system in more detail?

Feedback submitted
