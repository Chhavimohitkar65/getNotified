package ratelimit

import (
	"sync"
	"time"
)

// RateLimiter defines a rate limiter that limits requests per time window
type RateLimiter struct {
	// Mutex for concurrent access to the buckets map
	mu sync.Mutex
	
	// Map of API keys to their rate limit buckets
	buckets map[string]*TokenBucket
	
	// Configuration for the rate limiter
	requestsPerWindow int
	windowSize        time.Duration
	
	// Optional cleanup interval for removing expired buckets
	cleanupInterval time.Duration
	lastCleanup     time.Time
}

// TokenBucket represents a token bucket for a specific API key
type TokenBucket struct {
	tokens        int
	lastRefill    time.Time
	windowSize    time.Duration
	maxTokens     int
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(requestsPerWindow int, windowSize time.Duration) *RateLimiter {
	return &RateLimiter{
		buckets:           make(map[string]*TokenBucket),
		requestsPerWindow: requestsPerWindow,
		windowSize:        windowSize,
		cleanupInterval:   10 * time.Minute, // Clean up expired buckets every 10 minutes
		lastCleanup:       time.Now(),
	}
}

// Allow checks if a request is allowed for the given API key
// Returns true if the request is allowed, false otherwise
func (rl *RateLimiter) Allow(apiKey string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	// Check if we need to clean up expired buckets
	now := time.Now()
	if now.Sub(rl.lastCleanup) > rl.cleanupInterval {
		rl.cleanup(now)
	}
	
	// Get or create a bucket for this API key
	bucket, exists := rl.buckets[apiKey]
	if !exists {
		bucket = &TokenBucket{
			tokens:        rl.requestsPerWindow,
			lastRefill:    now,
			windowSize:    rl.windowSize,
			maxTokens:     rl.requestsPerWindow,
		}
		rl.buckets[apiKey] = bucket
	}
	
	// Refill tokens if enough time has passed
	elapsed := now.Sub(bucket.lastRefill)
	if elapsed >= bucket.windowSize {
		// Reset bucket entirely if a full window has passed
		bucket.tokens = bucket.maxTokens
		bucket.lastRefill = now
	}
	
	// Check if the request is allowed
	if bucket.tokens > 0 {
		bucket.tokens--
		return true
	}
	
	return false
}

// GetRemainingTokens returns the number of remaining tokens for an API key
func (rl *RateLimiter) GetRemainingTokens(apiKey string) int {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	bucket, exists := rl.buckets[apiKey]
	if !exists {
		return rl.requestsPerWindow
	}
	
	// Refill tokens if enough time has passed
	now := time.Now()
	elapsed := now.Sub(bucket.lastRefill)
	if elapsed >= bucket.windowSize {
		// Reset bucket entirely if a full window has passed
		bucket.tokens = bucket.maxTokens
		bucket.lastRefill = now
	}
	
	return bucket.tokens
}

// GetTimeUntilReset returns the time until the rate limit resets for an API key
func (rl *RateLimiter) GetTimeUntilReset(apiKey string) time.Duration {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	
	bucket, exists := rl.buckets[apiKey]
	if !exists {
		return 0
	}
	
	now := time.Now()
	elapsed := now.Sub(bucket.lastRefill)
	
	// If window has already passed, there's no wait time
	if elapsed >= bucket.windowSize {
		return 0
	}
	
	return bucket.windowSize - elapsed
}

// cleanup removes expired buckets that haven't been used recently
func (rl *RateLimiter) cleanup(now time.Time) {
	for key, bucket := range rl.buckets {
		// If the bucket hasn't been used in twice the window size, remove it
		if now.Sub(bucket.lastRefill) > bucket.windowSize*2 {
			delete(rl.buckets, key)
		}
	}
	rl.lastCleanup = now
}
