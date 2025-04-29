package handlers

import (
	"net/http"
	"strconv"

	"getnotified/internal/models"
	"getnotified/internal/repositories"
	"getnotified/internal/services/template"
	"getnotified/pkg/database"
	"getnotified/pkg/logger"
	"github.com/gin-gonic/gin"
)

// TemplateHandler handles HTTP requests for templates
type TemplateHandler struct {
	service *template.Service
	logger  *logger.Logger
}

// NewTemplateHandler creates a new template handler
func NewTemplateHandler(db *database.PostgresDB, logger *logger.Logger) *TemplateHandler {
	repo := repositories.NewTemplateRepository(db, logger)
	service := template.NewService(repo, logger)
	return &TemplateHandler{
		service: service,
		logger:  logger,
	}
}

// CreateTemplate handles POST /templates
func (h *TemplateHandler) CreateTemplate(c *gin.Context) {
	var req models.TemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	template, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		h.logger.Error("Failed to create template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, template)
}

// GetTemplate handles GET /templates/:id
func (h *TemplateHandler) GetTemplate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid template ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	template, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("Failed to get template: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Template not found"})
		return
	}

	c.JSON(http.StatusOK, template)
}

// UpdateTemplate handles PUT /templates/:id
func (h *TemplateHandler) UpdateTemplate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid template ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	var req models.TemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Error("Invalid request payload: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	template, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		h.logger.Error("Failed to update template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, template)
}

// DeleteTemplate handles DELETE /templates/:id
func (h *TemplateHandler) DeleteTemplate(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		h.logger.Error("Invalid template ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid template ID"})
		return
	}

	err = h.service.Delete(c.Request.Context(), id)
	if err != nil {
		h.logger.Error("Failed to delete template: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted successfully"})
}

// ListTemplates handles GET /templates
func (h *TemplateHandler) ListTemplates(c *gin.Context) {
	templates, err := h.service.List(c.Request.Context())
	if err != nil {
		h.logger.Error("Failed to list templates: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list templates", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, templates)
}
