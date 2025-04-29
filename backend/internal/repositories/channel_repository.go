package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"getnotified/internal/models"
	"getnotified/pkg/database"
	"getnotified/pkg/logger"
)

// ChannelRepository handles database operations for channels
type ChannelRepository struct {
	db     *database.PostgresDB
	logger *logger.Logger
}

// NewChannelRepository creates a new channel repository
func NewChannelRepository(db *database.PostgresDB, logger *logger.Logger) *ChannelRepository {
	return &ChannelRepository{
		db:     db,
		logger: logger,
	}
}

// Create adds a new channel to the database
func (r *ChannelRepository) Create(ctx context.Context, channel *models.Channel) error {
	query := `
		INSERT INTO channels (user_id, name, type, config, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	now := time.Now()
	channel.CreatedAt = now
	channel.UpdatedAt = now

	return r.db.DB.QueryRowContext(
		ctx,
		query,
		channel.UserID,
		channel.Name,
		channel.Type,
		channel.Config,
		channel.IsActive,
		channel.CreatedAt,
		channel.UpdatedAt,
	).Scan(&channel.ID)
}

// GetByID retrieves a channel by ID and user ID
func (r *ChannelRepository) GetByID(ctx context.Context, id int, userID int) (*models.Channel, error) {
	query := `
		SELECT id, user_id, name, type, config, is_active, created_at, updated_at
		FROM channels
		WHERE id = $1 AND user_id = $2
	`

	channel := &models.Channel{}
	err := r.db.DB.QueryRowContext(ctx, query, id, userID).Scan(
		&channel.ID,
		&channel.UserID,
		&channel.Name,
		&channel.Type,
		&channel.Config,
		&channel.IsActive,
		&channel.CreatedAt,
		&channel.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("channel not found")
		}
		return nil, err
	}

	return channel, nil
}

// ListByUserID retrieves all channels for a user
func (r *ChannelRepository) ListByUserID(ctx context.Context, userID int) ([]*models.Channel, error) {
	query := `
		SELECT id, user_id, name, type, config, is_active, created_at, updated_at
		FROM channels
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.DB.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	channels := []*models.Channel{}
	for rows.Next() {
		channel := &models.Channel{}
		err := rows.Scan(
			&channel.ID,
			&channel.UserID,
			&channel.Name,
			&channel.Type,
			&channel.Config,
			&channel.IsActive,
			&channel.CreatedAt,
			&channel.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		channels = append(channels, channel)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return channels, nil
}

// GetDefaultByType retrieves the default channel for a user by type
func (r *ChannelRepository) GetDefaultByType(ctx context.Context, userID int, channelType string) (*models.Channel, error) {
	query := `
		SELECT id, user_id, name, type, config, is_active, created_at, updated_at
		FROM channels
		WHERE user_id = $1 AND type = $2 AND is_active = true
	`

	rows, err := r.db.DB.QueryContext(ctx, query, userID, channelType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var defaultChannel *models.Channel

	for rows.Next() {
		channel := &models.Channel{}
		err := rows.Scan(
			&channel.ID,
			&channel.UserID,
			&channel.Name,
			&channel.Type,
			&channel.Config,
			&channel.IsActive,
			&channel.CreatedAt,
			&channel.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Parse the config to check if it's default
		var configMap map[string]interface{}
		if err := json.Unmarshal(channel.Config, &configMap); err != nil {
			continue
		}

		isDefault, ok := configMap["is_default"].(bool)
		if ok && isDefault {
			defaultChannel = channel
			break
		}

		// If we haven't found a default yet, save this one as a fallback
		if defaultChannel == nil {
			defaultChannel = channel
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	if defaultChannel == nil {
		return nil, errors.New("no active channel found for this type")
	}

	return defaultChannel, nil
}

// Update updates a channel in the database
func (r *ChannelRepository) Update(ctx context.Context, channel *models.Channel) error {
	query := `
		UPDATE channels
		SET name = $1, type = $2, config = $3, is_active = $4, updated_at = $5
		WHERE id = $6 AND user_id = $7
	`

	channel.UpdatedAt = time.Now()

	result, err := r.db.DB.ExecContext(
		ctx,
		query,
		channel.Name,
		channel.Type,
		channel.Config,
		channel.IsActive,
		channel.UpdatedAt,
		channel.ID,
		channel.UserID,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("channel not found or not owned by user")
	}

	return nil
}

// Delete removes a channel from the database
func (r *ChannelRepository) Delete(ctx context.Context, id int, userID int) error {
	query := `DELETE FROM channels WHERE id = $1 AND user_id = $2`
	
	result, err := r.db.DB.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("channel not found or not owned by user")
	}

	return nil
}
