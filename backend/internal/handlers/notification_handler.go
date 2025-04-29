package handlers

import (
	"net/http"
	"strconv"

	"getnotified/internal/models"
	"getnotified/internal/repositories"
	"getnotified/internal/services/notification"
	"getnotified/pkg/database"
	"getnotified/pkg/email"
	"getnotified/pkg/kafka"
	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// NotificationHandler handles HTTP requests for notifications
type NotificationHandler struct {
	service *notification.Service
	logger  *logger.Logger
}

// NewNotificationHandler creates a new notification handler
func NewNotificationHandler(db *database.PostgresDB, kafkaProducer *kafka.Producer, logger *logger.Logger) *NotificationHandler {
	// Initialize repositories
	notificationRepo := repositories.NewNotificationRepository(db, logger)
	templateRepo := repositories.NewTemplateRepository(db, logger)
	
	// Initialize email service with config from main app
	emailService := email.NewService(getEmailConfig(), logger)
	
	// Initialize notification service
	service := notification.NewService(notificationRepo, templateRepo, kafkaProducer, emailService, logger)
	
	return &NotificationHandler{
		service: service,
		logger:  logger,
	}
}

// getEmailConfig is a helper function to get email configuration
// This is a temporary solution - in a real app, this would be passed from main
func getEmailConfig() email.Config {
	return email.Config{
		APIKey:       "re_eVHEriVc_JmVmqFq55PzqXQtC5YZe4tPA", // This should come from environment variables
		FromEmail:    "simplivu@simplivu.com",                // This should come from environment variables
		Domain:       "simplivu.com",                         // This should come from environment variables
		DetailedLogs: true,                                   // This should come from environment variables
	}
}

// SendNotification handles POST /notifications
func (h *NotificationHandler) SendNotification(c *gin.Context) {
	var req models.NotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	response, err := h.service.SendNotification(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to send notification: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notification", "details": err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, response)
}

// GetNotification handles GET /notifications/:id
func (h *NotificationHandler) GetNotification(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid notification ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid notification ID"})
		return
	}

	notification, err := h.service.GetNotification(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get notification: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, notification)
}

// ListNotifications handles GET /notifications
func (h *NotificationHandler) ListNotifications(c *gin.Context) {
	// Get pagination parameters
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	notifications, total, err := h.service.ListNotifications(c.Request.Context(), page, pageSize)
	if err != nil {
		h.logger.Error("Failed to list notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list notifications", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       notifications,
		"total":      total,
		"page":       page,
		"page_size":  pageSize,
		"total_pages": (total + pageSize - 1) / pageSize,
	})
}
