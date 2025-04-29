package repositories

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"getnotified/internal/models"
	"getnotified/pkg/database"
	"getnotified/pkg/logger"
)

// UserRepository handles database operations for users
type UserRepository struct {
	db     *database.PostgresDB
	logger *logger.Logger
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *database.PostgresDB, logger *logger.Logger) *UserRepository {
	return &UserRepository{
		db:     db,
		logger: logger,
	}
}

// Create adds a new user to the database
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (email, password_hash, name, api_key, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	return r.db.DB.QueryRowContext(
		ctx,
		query,
		user.Email,
		user.PasswordHash,
		user.Name,
		user.APIKey,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)
}

// GetByEmail retrieves a user by email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, api_key, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	user := &models.User{}
	err := r.db.DB.QueryRowContext(ctx, query, email).Scan(
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

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id int) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, name, api_key, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &models.User{}
	err := r.db.DB.QueryRowContext(ctx, query, id).Scan(
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

// Update updates a user in the database
func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users
		SET name = $1, api_key = $2, updated_at = $3
		WHERE id = $4
	`

	user.UpdatedAt = time.Now()

	_, err := r.db.DB.ExecContext(
		ctx,
		query,
		user.Name,
		user.APIKey,
		user.UpdatedAt,
		user.ID,
	)

	return err
}

// UpdatePassword updates a user's password
func (r *UserRepository) UpdatePassword(ctx context.Context, userID int, passwordHash string) error {
	query := `
		UPDATE users
		SET password_hash = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.db.DB.ExecContext(
		ctx,
		query,
		passwordHash,
		time.Now(),
		userID,
	)

	return err
}

// Delete removes a user from the database
func (r *UserRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := r.db.DB.ExecContext(ctx, query, id)
	return err
}
