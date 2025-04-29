package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"getnotified/internal/services/user"
	"getnotified/pkg/logger"

	"github.com/gin-gonic/gin"
)

// UserAPIKeyHandler handles user API key operations
type UserAPIKeyHandler struct {
	userService *user.Service
	logger      *logger.Logger
}

// NewUserAPIKeyHandler creates a new user API key handler
func NewUserAPIKeyHandler(userService *user.Service, logger *logger.Logger) *UserAPIKeyHandler {
	return &UserAPIKeyHandler{
		userService: userService,
		logger:      logger,
	}
}

// GetAPIKey returns the current user's API key
func (h *UserAPIKeyHandler) GetAPIKey(c *gin.Context) {
	userID, exists := c.Get("user_id") // Changed from userID to user_id to match JWT middleware
	if !exists {
		h.logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Ensure userID is properly converted to int
	userIDInt, ok := userID.(int)
	if !ok {
		h.logger.Error("Failed to convert user_id to int: %v", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	apiKey, err := h.userService.GetAPIKey(c.Request.Context(), userIDInt)
	if err != nil {
		h.logger.Error("Failed to get API key: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get API key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"api_key": apiKey})
}

// RegenerateAPIKey generates a new API key for the user
func (h *UserAPIKeyHandler) RegenerateAPIKey(c *gin.Context) {
	userID, exists := c.Get("user_id") // Changed from userID to user_id to match JWT middleware
	if !exists {
		h.logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Ensure userID is properly converted to int
	userIDInt, ok := userID.(int)
	if !ok {
		h.logger.Error("Failed to convert user_id to int: %v", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Generate a new API key with tenant prefix for multi-tenant support
	userEmail, _ := c.Get("user_email")
	tenantPrefix := "gn_"
	if userEmail != nil {
		// Create a more specific prefix based on user email domain for multi-tenant support
		emailStr := userEmail.(string)
		parts := strings.Split(emailStr, "@")
		if len(parts) == 2 && len(parts[1]) > 0 {
			// Use first letter of domain name for the tenant prefix
			tenantLetter := string(parts[1][0])
			tenantPrefix = "gn_" + tenantLetter + "_"
		}
	}

	// Generate a new API key (32 bytes = 256 bits of entropy)
	newKey, err := generateAPIKey(tenantPrefix)
	if err != nil {
		h.logger.Error("Failed to generate API key: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate API key"})
		return
	}

	// Save the new API key
	if err := h.userService.UpdateAPIKey(c.Request.Context(), userIDInt, newKey); err != nil {
		h.logger.Error("Failed to save new API key: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new API key"})
		return
	}

	h.logger.Info("Successfully regenerated API key for user %d", userIDInt)
	c.JSON(http.StatusOK, gin.H{"api_key": newKey})
}

// generateAPIKey generates a secure random API key with the given prefix
func generateAPIKey(prefix string) (string, error) {
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

	return fmt.Sprintf("%s%s", prefix, encoded), nil
}
