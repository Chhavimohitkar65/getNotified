package notification

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"getnotified/internal/models"
	"getnotified/internal/repositories"
	"getnotified/pkg/email"
	"getnotified/pkg/kafka"
	"getnotified/pkg/logger"
)

// Service handles notification business logic
type Service struct {
	notificationRepo *repositories.NotificationRepository
	templateRepo     *repositories.TemplateRepository
	kafkaProducer    *kafka.Producer
	emailService     *email.Service
	logger           *logger.Logger
}

// NewService creates a new notification service
func NewService(
	notificationRepo *repositories.NotificationRepository,
	templateRepo *repositories.TemplateRepository,
	kafkaProducer *kafka.Producer,
	emailService *email.Service,
	logger *logger.Logger,
) *Service {
	return &Service{
		notificationRepo: notificationRepo,
		templateRepo:     templateRepo,
		kafkaProducer:    kafkaProducer,
		emailService:     emailService,
		logger:           logger,
	}
}

// SendNotification sends a notification
func (s *Service) SendNotification(ctx context.Context, req *models.NotificationRequest) (*models.NotificationResponse, error) {
	s.logger.Info("Processing notification request for recipient: %s", req.Recipient)

	// Prepare notification content
	var subject, content string
	var templateID *int

	// If template ID is provided, load the template
	if req.TemplateID != nil {
		template, err := s.templateRepo.GetByID(ctx, *req.TemplateID)
		if err != nil {
			return nil, fmt.Errorf("failed to get template: %w", err)
		}

		subject = template.Subject
		content = template.Content
		templateID = &template.ID

		// Apply variables to template
		if req.Variables != nil {
			for key, value := range req.Variables {
				strValue := fmt.Sprintf("%v", value)
				placeholder := fmt.Sprintf("{{%s}}", key)
				content = strings.ReplaceAll(content, placeholder, strValue)
				subject = strings.ReplaceAll(subject, placeholder, strValue)
			}
		}
	} else {
		// Use provided subject and content
		subject = req.Subject
		content = req.Content
	}

	// Create notification record
	metadata, err := json.Marshal(req.Variables)
	if err != nil {
		s.logger.Error("Failed to marshal variables: %v", err)
		metadata = nil
	}

	notification := &models.Notification{
		TemplateID: templateID,
		Recipient:  req.Recipient,
		Subject:    subject,
		Content:    content,
		Status:     models.NotificationStatusQueued,
		Channel:    req.Channel,
		Metadata:   metadata,
		CreatedAt:  time.Now(),
	}

	// Save to database
	notification, err = s.notificationRepo.Create(ctx, notification)
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	// Send to Kafka for async processing
	kafkaMessage := &models.KafkaNotificationMessage{
		ID:         notification.ID,
		TemplateID: notification.TemplateID,
		Recipient:  notification.Recipient,
		Subject:    notification.Subject,
		Content:    notification.Content,
		Channel:    notification.Channel,
		Variables:  req.Variables,
	}

	err = s.kafkaProducer.SendMessage(fmt.Sprintf("notification-%d", notification.ID), kafkaMessage)
	if err != nil {
		s.logger.Error("Failed to send message to Kafka: %v", err)
		// Update notification status to failed
		updateErr := s.notificationRepo.UpdateStatus(ctx, notification.ID, models.NotificationStatusFailed, nil)
		if updateErr != nil {
			s.logger.Error("Failed to update notification status: %v", updateErr)
		}
		return nil, fmt.Errorf("failed to queue notification: %w", err)
	}

	return &models.NotificationResponse{
		ID:      notification.ID,
		Status:  string(notification.Status),
		Message: "Notification queued successfully",
	}, nil
}

// ProcessNotification processes a notification from Kafka
func (s *Service) ProcessNotification(ctx context.Context, message *models.KafkaNotificationMessage) error {
	s.logger.Info("Processing notification ID: %d for recipient: %s", message.ID, message.Recipient)

	var err error
	now := time.Now()
	status := models.NotificationStatusSent

	// Process based on channel
	switch message.Channel {
	case "email":
		// Send email
		_, err = s.emailService.SendEmail(message.Recipient, message.Subject, message.Content, "")
		if err != nil {
			s.logger.Error("Failed to send email: %v", err)
			status = models.NotificationStatusFailed
		}
	case "sms":
		// SMS not implemented yet
		s.logger.Warn("SMS channel not implemented yet")
		status = models.NotificationStatusFailed
	case "push":
		// Push not implemented yet
		s.logger.Warn("Push notification channel not implemented yet")
		status = models.NotificationStatusFailed
	case "whatsapp":
		// WhatsApp not implemented yet
		s.logger.Warn("WhatsApp channel not implemented yet")
		status = models.NotificationStatusFailed
	default:
		s.logger.Error("Unknown notification channel: %s", message.Channel)
		status = models.NotificationStatusFailed
	}

	// Update notification status
	err = s.notificationRepo.UpdateStatus(ctx, message.ID, status, &now)
	if err != nil {
		s.logger.Error("Failed to update notification status: %v", err)
		return fmt.Errorf("failed to update notification status: %w", err)
	}

	return nil
}

// GetNotification gets a notification by ID
func (s *Service) GetNotification(ctx context.Context, id int) (*models.Notification, error) {
	s.logger.Info("Getting notification with ID: %d", id)
	return s.notificationRepo.GetByID(ctx, id)
}

// ListNotifications lists notifications with pagination
func (s *Service) ListNotifications(ctx context.Context, page, pageSize int) ([]*models.Notification, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	s.logger.Info("Listing notifications (page: %d, pageSize: %d)", page, pageSize)
	
	notifications, err := s.notificationRepo.List(ctx, pageSize, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list notifications: %w", err)
	}

	total, err := s.notificationRepo.Count(ctx)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	return notifications, total, nil
}
