package handlers

import (
	"net/http"
	"strconv"

	"getnotified/internal/models"
	"getnotified/internal/services/channel"
	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// ChannelHandler handles HTTP requests for user notification channels
type ChannelHandler struct {
	service *channel.Service
	logger  *logger.Logger
}

// NewChannelHandler creates a new channel handler
func NewChannelHandler(service *channel.Service, logger *logger.Logger) *ChannelHandler {
	return &ChannelHandler{
		service: service,
		logger:  logger,
	}
}

// Create handles POST /channels
func (h *ChannelHandler) Create(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req models.ChannelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid channel request payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	h.logger.Info("Creating new channel '%s' of type '%s' for user %d", req.Name, req.Type, userID)
	channel, err := h.service.Create(c.Request.Context(), userID.(int), &req)
	if err != nil {
		h.logger.Error("Failed to create channel: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create channel", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, channel)
}

// GetByID handles GET /channels/:id
func (h *ChannelHandler) GetByID(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid channel ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid channel ID"})
		return
	}

	channel, err := h.service.Get(c.Request.Context(), id, userID.(int))
	if err != nil {
		h.logger.Error("Failed to get channel: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Channel not found"})
		return
	}

	c.JSON(http.StatusOK, channel)
}

// List handles GET /channels
func (h *ChannelHandler) List(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	channels, err := h.service.List(c.Request.Context(), userID.(int))
	if err != nil {
		h.logger.Error("Failed to list channels: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list channels"})
		return
	}

	c.JSON(http.StatusOK, channels)
}

// Update handles PUT /channels/:id
func (h *ChannelHandler) Update(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid channel ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid channel ID"})
		return
	}

	var req models.ChannelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid channel update payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	h.logger.Info("Updating channel %d for user %d", id, userID)
	channel, err := h.service.Update(c.Request.Context(), id, userID.(int), &req)
	if err != nil {
		h.logger.Error("Failed to update channel: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update channel", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, channel)
}

// Delete handles DELETE /channels/:id
func (h *ChannelHandler) Delete(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid channel ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid channel ID"})
		return
	}

	h.logger.Info("Deleting channel %d for user %d", id, userID)
	if err := h.service.Delete(c.Request.Context(), id, userID.(int)); err != nil {
		h.logger.Error("Failed to delete channel: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete channel"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Channel deleted successfully"})
}
