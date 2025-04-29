package handlers

import (
	"bytes"
	"io"
	"net/http"

	"getnotified/internal/models"
	"getnotified/internal/services/user"
	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	service *user.Service
	logger  *logger.Logger
}

// NewUserHandler creates a new user handler
func NewUserHandler(service *user.Service, logger *logger.Logger) *UserHandler {
	return &UserHandler{
		service: service,
		logger:  logger,
	}
}

// Register handles user registration
func (h *UserHandler) Register(c *gin.Context) {
	// Log the raw request body for debugging
	bodyBytes, _ := io.ReadAll(c.Request.Body)
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	h.logger.Info("Raw request body: %s", string(bodyBytes))

	var req models.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid user registration payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	h.logger.Info("Registering new user with email: %s", req.Email)
	user, err := h.service.Register(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to register user: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate a token for the newly registered user
	token, err := h.service.Login(c.Request.Context(), &models.LoginRequest{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		// If token generation fails, still return the user but log the error
		h.logger.Error("Failed to generate token for new user: %v", err)
		c.JSON(http.StatusCreated, user)
		return
	}

	c.JSON(http.StatusCreated, token)
}

// Login handles user login
func (h *UserHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid login payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	h.logger.Info("User login attempt: %s", req.Email)
	response, err := h.service.Login(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Login failed for user %s: %v", req.Email, err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetProfile handles getting the current user's profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, err := h.service.GetUser(c.Request.Context(), userID.(int))
	if err != nil {
		h.logger.Error("Failed to get user profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile handles updating the current user's profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid profile update payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	user, err := h.service.UpdateUser(c.Request.Context(), userID.(int), req.Name)
	if err != nil {
		h.logger.Error("Failed to update user profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdatePassword handles updating the current user's password
func (h *UserHandler) UpdatePassword(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Error("User ID not found in request context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid password update payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	err := h.service.UpdatePassword(c.Request.Context(), userID.(int), req.CurrentPassword, req.NewPassword)
	if err != nil {
		h.logger.Error("Failed to update user password: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
