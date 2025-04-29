package template

import (
	"context"
	"fmt"

	"getnotified/internal/models"
	"getnotified/internal/repositories"
	"getnotified/pkg/logger"
)

// Service handles template business logic
type Service struct {
	repo   *repositories.TemplateRepository
	logger *logger.Logger
}

// NewService creates a new template service
func NewService(repo *repositories.TemplateRepository, logger *logger.Logger) *Service {
	return &Service{
		repo:   repo,
		logger: logger,
	}
}

// Create creates a new template
func (s *Service) Create(ctx context.Context, req *models.TemplateRequest) (*models.Template, error) {
	// Validate request data
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid template data: %w", err)
	}

	s.logger.Info("Creating new template with name: %s", req.Name)
	return s.repo.Create(ctx, req)
}

// GetByID retrieves a template by ID
func (s *Service) GetByID(ctx context.Context, id int) (*models.Template, error) {
	s.logger.Info("Getting template with ID: %d", id)
	return s.repo.GetByID(ctx, id)
}

// Update updates a template
func (s *Service) Update(ctx context.Context, id int, req *models.TemplateRequest) (*models.Template, error) {
	// Validate request data
	if err := req.Validate(); err != nil {
		return nil, fmt.Errorf("invalid template data: %w", err)
	}

	// Check if template exists
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("template not found: %w", err)
	}

	s.logger.Info("Updating template with ID: %d", id)
	return s.repo.Update(ctx, id, req)
}

// Delete deletes a template
func (s *Service) Delete(ctx context.Context, id int) error {
	// Check if template exists
	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("template not found: %w", err)
	}

	s.logger.Info("Deleting template with ID: %d", id)
	return s.repo.Delete(ctx, id)
}

// List lists all templates
func (s *Service) List(ctx context.Context) ([]*models.Template, error) {
	s.logger.Info("Listing all templates")
	return s.repo.List(ctx)
}
