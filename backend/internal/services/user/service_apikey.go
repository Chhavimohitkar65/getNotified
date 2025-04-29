package user

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

// GetAPIKey retrieves a user's API key
func (s *Service) GetAPIKey(ctx context.Context, userID int) (string, error) {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return "", err
	}

	// If the user doesn't have an API key yet, generate one
	if user.APIKey == "" {
		apiKey, err := s.generateAPIKey()
		if err != nil {
			return "", err
		}

		// Update the user with the new API key
		if err := s.UpdateAPIKey(ctx, userID, apiKey); err != nil {
			return "", err
		}

		return apiKey, nil
	}

	return user.APIKey, nil
}

// UpdateAPIKey updates a user's API key
func (s *Service) UpdateAPIKey(ctx context.Context, userID int, apiKey string) error {
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	user.APIKey = apiKey
	return s.repo.Update(ctx, user)
}

// generateAPIKey generates a new API key
func (s *Service) generateAPIKey() (string, error) {
	// Generate 24 bytes (192 bits) of random data
	randomBytes := make([]byte, 24)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", err
	}

	// Encode as base64 and remove any non-alphanumeric characters
	encoded := base64.URLEncoding.EncodeToString(randomBytes)
	// Remove padding characters
	encoded = encoded[:32]

	return fmt.Sprintf("gn_%s", encoded), nil
}
