package models

import (
	"encoding/json"
	"time"
)

// NotificationStatus represents the status of a notification
type NotificationStatus string

// Notification status constants
const (
	// NotificationStatusQueued indicates the notification is queued for delivery
	NotificationStatusQueued NotificationStatus = "queued"
	// NotificationStatusProcessing indicates the notification is being processed
	NotificationStatusProcessing NotificationStatus = "processing"
	// NotificationStatusSent indicates the notification was sent
	NotificationStatusSent NotificationStatus = "sent"
	// NotificationStatusDelivered indicates the notification was delivered
	NotificationStatusDelivered NotificationStatus = "delivered"
	// NotificationStatusFailed indicates the notification failed to deliver
	NotificationStatusFailed NotificationStatus = "failed"
)

// Notification represents a notification
type Notification struct {
	ID         int               `json:"id"`
	TemplateID *int              `json:"template_id,omitempty"`
	Recipient  string            `json:"recipient"`
	Subject    string            `json:"subject"`
	Content    string            `json:"content"`
	Status     NotificationStatus `json:"status"`
	Channel    string            `json:"channel"`
	Metadata   json.RawMessage   `json:"metadata,omitempty"`
	CreatedAt  time.Time         `json:"created_at"`
	SentAt     *time.Time        `json:"sent_at,omitempty"`
}

// NotificationRequest represents a request to send a notification
type NotificationRequest struct {
	TemplateID  *int                    `json:"template_id"`
	Recipient   string                  `json:"recipient" binding:"required"`
	Subject     string                  `json:"subject"`
	Content     string                  `json:"content"`
	Channel     string                  `json:"channel" binding:"required,oneof=email sms push whatsapp"`
	Variables   map[string]interface{}  `json:"variables"`
}

// KafkaNotificationMessage represents a notification message for Kafka
type KafkaNotificationMessage struct {
	ID         int                     `json:"id"`
	TemplateID *int                    `json:"template_id,omitempty"`
	Recipient  string                  `json:"recipient"`
	Subject    string                  `json:"subject"`
	Content    string                  `json:"content"`
	Channel    string                  `json:"channel"`
	Variables  map[string]interface{}  `json:"variables,omitempty"`
}

// NotificationResponse represents a response after sending a notification
type NotificationResponse struct {
	ID       int    `json:"id"`
	Status   string `json:"status"`
	Message  string `json:"message,omitempty"`
}
