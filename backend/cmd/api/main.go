package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"getnotified/internal/config"
	"getnotified/internal/handlers"
	"getnotified/internal/middleware"
	"getnotified/internal/repositories"
	"getnotified/internal/services/channel"
	"getnotified/internal/services/user"
	"getnotified/pkg/auth"
	"getnotified/pkg/database"
	"getnotified/pkg/kafka"
	"getnotified/pkg/logger"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	// Initialize logger
	logger := logger.NewLogger()
	logger.Info("Starting notification service")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Fatal("Failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := database.NewPostgresDB(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database: %v", err)
	}
	defer db.Close()
	
	// Run database migrations
	// Use absolute path to migrations folder
	cwd, _ := os.Getwd()
	migrationsPath := filepath.Join(cwd, "migrations") // Path to migration files
	// Create a zap logger for migrations (since MigrationConfig requires zap.Logger)
	zapLogger, _ := zap.NewProduction()
	if err := database.RunMigrations(database.MigrationConfig{
		MigrationsPath: migrationsPath,
		DBConfig: &database.PostgresConfig{
			Host:     cfg.Database.Host,
			Port:     cfg.Database.Port,
			User:     cfg.Database.User,
			Password: cfg.Database.Password,
			DBName:   cfg.Database.DBName,
			SSLMode:  cfg.Database.SSLMode,
		},
		Logger: zapLogger,
	}); err != nil {
		logger.Fatal("Failed to run migrations: %v", err)
	}
	logger.Info("Database migrations completed successfully")

	// Initialize Kafka
	kafkaProducer, err := kafka.NewProducer(cfg.Kafka)
	if err != nil {
		logger.Fatal("Failed to initialize Kafka producer: %v", err)
	}
	defer kafkaProducer.Close()

	// Initialize repositories, services, and handlers
	router := setupRouter(cfg, db, kafkaProducer, logger)

	// Start HTTP server
	server := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: router,
	}

	// Server in a goroutine so that it doesn't block
	go func() {
		logger.Info("Server starting on port %s", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown: %v", err)
	}

	logger.Info("Server exiting")
}

func setupRouter(cfg *config.Config, db *database.PostgresDB, kafkaProducer *kafka.Producer, logger *logger.Logger) *gin.Engine {
	// Set Gin to release mode in production
	if cfg.Server.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.LoggerMiddleware(logger))

	// Configure CORS - move this before other middleware to ensure it runs first
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080", "*"}, // Frontend URLs
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	// Add a handler specifically for OPTIONS requests
	router.OPTIONS("/api/v1/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Initialize JWT auth service
	authService := auth.NewService(auth.Config{
		SecretKey:     cfg.Auth.JWTSecret,
		TokenDuration: 24 * time.Hour,
	})

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db, logger)
	channelRepo := repositories.NewChannelRepository(db, logger)

	// Initialize services
	userService := user.NewService(userRepo, authService, logger)
	channelService := channel.NewService(channelRepo, logger)

	// Initialize handlers
	notificationHandler := handlers.NewNotificationHandler(db, kafkaProducer, logger)
	templateHandler := handlers.NewTemplateHandler(db, logger)
	userHandler := handlers.NewUserHandler(userService, logger)
	channelHandler := handlers.NewChannelHandler(channelService, logger)

	// Public routes (no auth required)
	router.POST("/api/v1/auth/register", userHandler.Register)
	router.POST("/api/v1/auth/login", userHandler.Login)
	router.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Protected routes (auth required)
	protected := router.Group("/api/v1")
	// Apply JWT auth middleware
	protected.Use(middleware.JWTAuthMiddleware(authService, logger))
	
	// Also apply X-API-Key auth middleware if needed for backward compatibility
	if cfg.Server.Environment != "development" || !cfg.Auth.SkipInDevelopment {
		protected.Use(middleware.AuthMiddleware(cfg.Auth, logger))
	}
	
	{
		// User profile
		protected.GET("/user/profile", userHandler.GetProfile)
		protected.PUT("/user/profile", userHandler.UpdateProfile)
		protected.PUT("/user/password", userHandler.UpdatePassword)

		// Channels
		protected.GET("/channels", channelHandler.List)
		protected.POST("/channels", channelHandler.Create)
		protected.GET("/channels/:id", channelHandler.GetByID)
		protected.PUT("/channels/:id", channelHandler.Update)
		protected.DELETE("/channels/:id", channelHandler.Delete)

		// Templates
		protected.GET("/templates", templateHandler.ListTemplates)
		protected.POST("/templates", templateHandler.CreateTemplate)
		protected.GET("/templates/:id", templateHandler.GetTemplate)
		protected.PUT("/templates/:id", templateHandler.UpdateTemplate)
		protected.DELETE("/templates/:id", templateHandler.DeleteTemplate)

		// Notifications
		protected.POST("/notifications", notificationHandler.SendNotification)
		protected.GET("/notifications", notificationHandler.ListNotifications)
		protected.GET("/notifications/:id", notificationHandler.GetNotification)
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	return router
}
