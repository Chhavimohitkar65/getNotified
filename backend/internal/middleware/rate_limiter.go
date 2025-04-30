package middleware

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"getnotified/pkg/ratelimit"

	"github.com/gin-gonic/gin"
)

// RateLimiterMiddleware is a middleware that limits the number of requests per time window
type RateLimiterMiddleware struct {
	rateLimiter *ratelimit.RateLimiter
}

// NewRateLimiterMiddleware creates a new rate limiter middleware
func NewRateLimiterMiddleware(requestsPerWindow int, windowSize time.Duration) *RateLimiterMiddleware {
	return &RateLimiterMiddleware{
		rateLimiter: ratelimit.NewRateLimiter(requestsPerWindow, windowSize),
	}
}

// Middleware returns a Gin middleware function that applies rate limiting
func (m *RateLimiterMiddleware) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract API key from the request
		apiKey := extractAPIKey(c)
		if apiKey == "" {
			// No API key found, we'll use the IP address as the identifier
			apiKey = c.ClientIP()
		}

		// Check if the request is allowed
		if !m.rateLimiter.Allow(apiKey) {
			// Calculate time until the rate limit resets
			resetTime := m.rateLimiter.GetTimeUntilReset(apiKey)
			resetSeconds := int(resetTime.Seconds())
			if resetSeconds < 1 {
				resetSeconds = 1 // Minimum 1 second
			}

			// Set rate limit headers
			c.Header("X-RateLimit-Limit", "2") // 2 requests per window
			c.Header("X-RateLimit-Remaining", "0") // No requests remaining
			c.Header("X-RateLimit-Reset", strconv.Itoa(resetSeconds)) // Time until reset in seconds
			c.Header("Retry-After", strconv.Itoa(resetSeconds)) // RFC 7231 compliant header

			// Return a 429 Too Many Requests response
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Try again in a few seconds.",
				"retry_after": resetSeconds,
			})
			c.Abort()
			return
		}

		// Add remaining rate limit info to headers
		remainingTokens := m.rateLimiter.GetRemainingTokens(apiKey)
		c.Header("X-RateLimit-Limit", "2") // 2 requests per window
		c.Header("X-RateLimit-Remaining", strconv.Itoa(remainingTokens))

		// Continue to the next middleware or handler
		c.Next()
	}
}

// extractAPIKey gets the API key from various possible locations in the request
func extractAPIKey(c *gin.Context) string {
	// Try to get from the X-API-Key header (preferred method)
	apiKey := c.GetHeader("X-API-Key")
	if apiKey != "" {
		return apiKey
	}

	// Try to get from the Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		// Check if it's a Bearer token
		if strings.HasPrefix(authHeader, "Bearer ") {
			return strings.TrimPrefix(authHeader, "Bearer ")
		}
		return authHeader
	}

	// Try to get from query string
	apiKey = c.Query("api_key")
	if apiKey != "" {
		return apiKey
	}

	return ""
}
