package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"go.uber.org/zap"

	"getnotified/internal/models"
	"getnotified/internal/repositories"
	"getnotified/pkg/email"
	"getnotified/pkg/kafka"
)

// NotificationConsumerService processes notifications from Kafka
type NotificationConsumerService struct {
	consumer          *kafka.Consumer
	notificationRepo  *repositories.NotificationRepository
	logger            *zap.Logger
	emailService      *email.Service
	notificationTopic string
}

// NotificationConsumerConfig holds configuration for the notification consumer
type NotificationConsumerConfig struct {
	KafkaConfig      kafka.ConsumerConfig
	NotificationTopic string
	Logger           *zap.Logger
}

// NewNotificationConsumerService creates a new notification consumer service
func NewNotificationConsumerService(
	config NotificationConsumerConfig,
	notificationRepo *repositories.NotificationRepository,
	emailService *email.Service,
) (*NotificationConsumerService, error) {
	consumer, err := kafka.NewConsumer(config.KafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka consumer: %w", err)
	}

	service := &NotificationConsumerService{
		consumer:          consumer,
		notificationRepo:  notificationRepo,
		emailService:      emailService,
		logger:            config.Logger,
		notificationTopic: config.NotificationTopic,
	}

	// Register the notification handler
	consumer.RegisterHandler(config.NotificationTopic, service.handleNotification)
	
	// Add the topic to the consumer config
	config.KafkaConfig.Topics = append(config.KafkaConfig.Topics, config.NotificationTopic)

	return service, nil
}

// Start begins processing notifications
func (s *NotificationConsumerService) Start(ctx context.Context) error {
	s.logger.Info("Starting notification consumer service",
		zap.String("topic", s.notificationTopic),
	)
	return s.consumer.Start(ctx)
}

// handleNotification processes a notification message from Kafka
func (s *NotificationConsumerService) handleNotification(data []byte) error {
	// Parse notification data
	var notification models.Notification
	if err := json.Unmarshal(data, &notification); err != nil {
		return fmt.Errorf("failed to unmarshal notification: %w", err)
	}

	s.logger.Info("Processing notification",
		zap.Int("id", notification.ID),
		zap.String("recipient", notification.Recipient),
		zap.String("channel", notification.Channel),
	)

	// Update notification status to "processing"
	notification.Status = models.NotificationStatusProcessing
	if err := s.notificationRepo.UpdateNotification(&notification); err != nil {
		return fmt.Errorf("failed to update notification status: %w", err)
	}

	var err error
	// Process based on channel type
	switch notification.Channel {
	case "email":
		err = s.sendEmailNotification(&notification)
	default:
		err = fmt.Errorf("unsupported channel: %s", notification.Channel)
	}

	// Update notification status based on result
	if err != nil {
		s.logger.Error("Failed to send notification",
			zap.Int("id", notification.ID),
			zap.Error(err),
		)
		notification.Status = models.NotificationStatusFailed
	} else {
		notification.Status = models.NotificationStatusSent
		sentAt := time.Now()
		notification.SentAt = &sentAt
	}

	// Update the notification in the database
	if err := s.notificationRepo.UpdateNotification(&notification); err != nil {
		s.logger.Error("Failed to update notification",
			zap.Int("id", notification.ID),
			zap.Error(err),
		)
		return err
	}

	s.logger.Info("Notification processed successfully",
		zap.Int("id", notification.ID),
		zap.String("status", string(notification.Status)),
	)
	return nil
}

// sendEmailNotification sends an email notification
func (s *NotificationConsumerService) sendEmailNotification(notification *models.Notification) error {
	// Use individual parameters for the email service
	_, err := s.emailService.SendEmail(
		notification.Recipient,
		notification.Subject,
		notification.Content, // Using content as HTML
		"", // No plain text version
	)

	return err
}

// Close closes the consumer
func (s *NotificationConsumerService) Close() error {
	s.logger.Info("Closing notification consumer service")
	return s.consumer.Close()
}
