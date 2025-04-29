package email

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"getnotified/pkg/logger"
)

// Config holds email service configuration
type Config struct {
	APIKey       string
	FromEmail    string
	Domain       string
	DetailedLogs bool
}

// Service handles email sending
type Service struct {
	apiKey  string
	from    string
	domain  string
	logger  *logger.Logger
	client  *http.Client
	verbose bool
}

// EmailRequest represents a request to send an email
type EmailRequest struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
	Text    string `json:"text,omitempty"`
}

// EmailResponse represents a response from the email API
type EmailResponse struct {
	ID      string `json:"id"`
	From    string `json:"from"`
	To      string `json:"to"`
	Created string `json:"created"`
}

// NewService creates a new email service
func NewService(cfg Config, logger *logger.Logger) *Service {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	return &Service{
		apiKey:  cfg.APIKey,
		from:    cfg.FromEmail,
		domain:  cfg.Domain,
		logger:  logger,
		client:  client,
		verbose: cfg.DetailedLogs,
	}
}

// SendEmail sends an email via Resend API
func (s *Service) SendEmail(to, subject, htmlContent, textContent string) (string, error) {
	if s.verbose {
		s.logger.Info("Preparing to send email to %s with subject: %s", to, subject)
	}

	reqBody := EmailRequest{
		From:    s.from,
		To:      to,
		Subject: subject,
		HTML:    htmlContent,
	}

	if textContent != "" {
		reqBody.Text = textContent
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal email request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create email request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	if s.verbose {
		s.logger.Debug("Sending email request to Resend API")
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send email request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errorResp map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&errorResp)
		if err != nil {
			return "", fmt.Errorf("failed to parse error response: %w", err)
		}
		return "", fmt.Errorf("email API returned error: %v", errorResp)
	}

	var emailResp EmailResponse
	err = json.NewDecoder(resp.Body).Decode(&emailResp)
	if err != nil {
		return "", fmt.Errorf("failed to parse email response: %w", err)
	}

	if s.verbose {
		s.logger.Info("Email sent successfully to %s with ID: %s", to, emailResp.ID)
	}

	return emailResp.ID, nil
}
