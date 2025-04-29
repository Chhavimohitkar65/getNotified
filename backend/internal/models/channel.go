package models

import (
	"encoding/json"
	"time"
)

// Channel represents a notification channel configuration for a user
type Channel struct {
	ID        int             `json:"id"`
	UserID    int             `json:"user_id"`
	Name      string          `json:"name"`
	Type      string          `json:"type"` // email, sms, push, whatsapp
	Config    json.RawMessage `json:"config"`
	IsActive  bool            `json:"is_active"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// ChannelRequest represents a request to create/update a channel
type ChannelRequest struct {
	Name     string                 `json:"name" binding:"required"`
	Type     string                 `json:"type" binding:"required,oneof=email sms push whatsapp"`
	Config   map[string]interface{} `json:"config" binding:"required"`
	IsActive *bool                  `json:"is_active,omitempty"`
}

// EmailConfig represents the configuration for an email channel
type EmailConfig struct {
	Provider   string `json:"provider" binding:"required,oneof=resend mailersend sendgrid"`
	APIKey     string `json:"api_key" binding:"required"`
	FromEmail  string `json:"from_email" binding:"required,email"`
	FromName   string `json:"from_name,omitempty"`
	Domain     string `json:"domain,omitempty"`
	IsDefault  bool   `json:"is_default"`
}

// SMSConfig represents the configuration for an SMS channel
type SMSConfig struct {
	Provider   string `json:"provider" binding:"required,oneof=twilio"`
	AccountSID string `json:"account_sid" binding:"required"`
	AuthToken  string `json:"auth_token" binding:"required"`
	FromNumber string `json:"from_number" binding:"required"`
	IsDefault  bool   `json:"is_default"`
}

// ChannelResponse represents a response for a channel
type ChannelResponse struct {
	ID        int                    `json:"id"`
	Name      string                 `json:"name"`
	Type      string                 `json:"type"`
	Config    map[string]interface{} `json:"config"`
	IsActive  bool                   `json:"is_active"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
}
