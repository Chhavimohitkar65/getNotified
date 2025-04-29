package models

import (
	"time"
)

// Template represents a notification template
type Template struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Subject     string    `json:"subject"`
	Channel     string    `json:"channel"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TemplateRequest represents a request to create or update a template
type TemplateRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Subject     string `json:"subject" binding:"required"`
	Channel     string `json:"channel" binding:"required,oneof=email sms push whatsapp"`
	Content     string `json:"content" binding:"required"`
}

// Validate validates the template request
func (t *TemplateRequest) Validate() error {
	// Add any custom validation logic here
	return nil
}
