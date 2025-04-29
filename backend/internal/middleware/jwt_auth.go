package middleware

import (
	"net/http"
	"strings"

	"getnotified/pkg/auth"
	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// JWTAuthMiddleware creates a middleware for JWT authentication
func JWTAuthMiddleware(authSvc *auth.Service, logger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logger.Error("Missing authorization header")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		// Token format should be "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			logger.Error("Invalid authorization header format")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer <token>"})
			return
		}

		// Validate token
		token := parts[1]
		claims, err := authSvc.ValidateToken(token)
		if err != nil {
			if err == auth.ErrExpiredToken {
				logger.Error("Token has expired")
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
				return
			}
			logger.Error("Invalid token: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)

		c.Next()
	}
}
