package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"getnotified/internal/models"
	"getnotified/pkg/database"
	"getnotified/pkg/logger"
)

// TemplateRepository handles database operations for templates
type TemplateRepository struct {
	db     *database.PostgresDB
	logger *logger.Logger
}

// NewTemplateRepository creates a new template repository
func NewTemplateRepository(db *database.PostgresDB, logger *logger.Logger) *TemplateRepository {
	return &TemplateRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new template
func (r *TemplateRepository) Create(ctx context.Context, template *models.TemplateRequest) (*models.Template, error) {
	query := `
		INSERT INTO templates (name, description, subject, channel, content, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, description, subject, channel, content, created_at, updated_at
	`

	now := time.Now()
	row := r.db.DB.QueryRowContext(
		ctx,
		query,
		template.Name,
		template.Description,
		template.Subject,
		template.Channel,
		template.Content,
		now,
		now,
	)

	var t models.Template
	err := row.Scan(
		&t.ID,
		&t.Name,
		&t.Description,
		&t.Subject,
		&t.Channel,
		&t.Content,
		&t.CreatedAt,
		&t.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create template: %w", err)
	}

	return &t, nil
}

// GetByID retrieves a template by ID
func (r *TemplateRepository) GetByID(ctx context.Context, id int) (*models.Template, error) {
	query := `
		SELECT id, name, description, subject, channel, content, created_at, updated_at
		FROM templates
		WHERE id = $1
	`

	row := r.db.DB.QueryRowContext(ctx, query, id)

	var t models.Template
	err := row.Scan(
		&t.ID,
		&t.Name,
		&t.Description,
		&t.Subject,
		&t.Channel,
		&t.Content,
		&t.CreatedAt,
		&t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("template not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get template: %w", err)
	}

	return &t, nil
}

// Update updates a template
func (r *TemplateRepository) Update(ctx context.Context, id int, template *models.TemplateRequest) (*models.Template, error) {
	query := `
		UPDATE templates
		SET name = $1, description = $2, subject = $3, channel = $4, content = $5, updated_at = $6
		WHERE id = $7
		RETURNING id, name, description, subject, channel, content, created_at, updated_at
	`

	now := time.Now()
	row := r.db.DB.QueryRowContext(
		ctx,
		query,
		template.Name,
		template.Description,
		template.Subject,
		template.Channel,
		template.Content,
		now,
		id,
	)

	var t models.Template
	err := row.Scan(
		&t.ID,
		&t.Name,
		&t.Description,
		&t.Subject,
		&t.Channel,
		&t.Content,
		&t.CreatedAt,
		&t.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("template not found: %w", err)
		}
		return nil, fmt.Errorf("failed to update template: %w", err)
	}

	return &t, nil
}

// Delete deletes a template
func (r *TemplateRepository) Delete(ctx context.Context, id int) error {
	query := `
		DELETE FROM templates
		WHERE id = $1
	`

	result, err := r.db.DB.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete template: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("template not found")
	}

	return nil
}

// List retrieves all templates
func (r *TemplateRepository) List(ctx context.Context) ([]*models.Template, error) {
	query := `
		SELECT id, name, description, subject, channel, content, created_at, updated_at
		FROM templates
		ORDER BY created_at DESC
	`

	rows, err := r.db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list templates: %w", err)
	}
	defer rows.Close()

	templates := make([]*models.Template, 0)
	for rows.Next() {
		var t models.Template
		err := rows.Scan(
			&t.ID,
			&t.Name,
			&t.Description,
			&t.Subject,
			&t.Channel,
			&t.Content,
			&t.CreatedAt,
			&t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan template: %w", err)
		}
		templates = append(templates, &t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating templates: %w", err)
	}

	return templates, nil
}
