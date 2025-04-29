package middleware

import (
	"getnotified/internal/config"
	"getnotified/internal/repositories"
	"getnotified/pkg/logger"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// APIKeyAuthMiddleware protects routes with API key authentication
// This middleware supports both the global API key and user-specific API keys
func APIKeyAuthMiddleware(
	authConfig config.AuthConfig,
	userRepo *repositories.UserRepository,
	logger *logger.Logger,
) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip auth in development mode if configured to do so
		if authConfig.SkipInDevelopment {
			c.Next()
			return
		}

		// First check for X-API-Key header which is commonly used for API key auth
		apiKey := c.GetHeader("X-API-Key")
		
		// If X-API-Key is not present, try Authorization header
		if apiKey == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				logger.Warn("Missing API key in headers")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error": "API key is required via X-API-Key or Authorization header",
				})
				return
			}

			// Check if the Authorization header has the format "Bearer <api-key>"
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				logger.Warn("Invalid Authorization header format")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error": "Invalid Authorization header format. Expected: Bearer <api-key>",
				})
				return
			}

			apiKey = parts[1]
		}

		// First try to match against the global API key
		if apiKey == authConfig.APIKey {
			// Global API key is valid
			logger.Info("Request authenticated with global API key")
			c.Next()
			return
		}

		// If not the global key, try to find a user with this API key
		user, err := userRepo.GetByAPIKey(c.Request.Context(), apiKey)
		if err != nil || user == nil {
			logger.Warn("Invalid API key: no matching user found")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})
			return
		}

		// Set user info in context for later use
		c.Set("user_id", user.ID)
		c.Set("user_email", user.Email)
		logger.Info("Request authenticated with user API key for user ID: %d", user.ID)

		// Auth successful, continue
		c.Next()
	}
}
