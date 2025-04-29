package middleware

import (
	"getnotified/internal/config"
	"getnotified/pkg/logger"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware protects routes with API key authentication
func AuthMiddleware(authConfig config.AuthConfig, logger *logger.Logger) gin.HandlerFunc {
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
		// Compare with configured API key
		if apiKey != authConfig.APIKey {
			logger.Warn("Invalid API key")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API key",
			})
			return
		}

		// Auth successful, continue
		c.Next()
	}
}
