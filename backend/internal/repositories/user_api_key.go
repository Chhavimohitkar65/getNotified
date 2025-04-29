package repositories

import (
	"context"
	"database/sql"
	"errors"

	"getnotified/internal/models"
)

// GetByAPIKey retrieves a user by their API key
func (r *UserRepository) GetByAPIKey(ctx context.Context, apiKey string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, api_key, created_at, updated_at
		FROM users
		WHERE api_key = $1
	`

	user := &models.User{}
	err := r.db.DB.QueryRowContext(ctx, query, apiKey).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.Name,
		&user.APIKey,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return user, nil
}
