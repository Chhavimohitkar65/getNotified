package middleware

import (
	"time"

	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// LoggerMiddleware returns a middleware for logging HTTP requests
func LoggerMiddleware(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// Process request
		c.Next()

		// After request is processed
		latency := time.Since(start)
		status := c.Writer.Status()

		log.HTTPMiddlewareLogger(method, path, status, latency)
	}
}
