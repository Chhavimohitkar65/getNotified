package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"getnotified/internal/models"
	"getnotified/pkg/database"
	"getnotified/pkg/logger"
)

// NotificationRepository handles database operations for notifications
type NotificationRepository struct {
	db     *database.PostgresDB
	logger *logger.Logger
}

// NewNotificationRepository creates a new notification repository
func NewNotificationRepository(db *database.PostgresDB, logger *logger.Logger) *NotificationRepository {
	return &NotificationRepository{
		db:     db,
		logger: logger,
	}
}

// Create creates a new notification record
func (r *NotificationRepository) Create(ctx context.Context, n *models.Notification) (*models.Notification, error) {
	query := `
		INSERT INTO notifications (template_id, recipient, subject, content, status, channel, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, template_id, recipient, subject, content, status, channel, metadata, created_at, sent_at
	`

	var metadata sql.NullString
	if n.Metadata != nil {
		metadata = sql.NullString{
			String: string(n.Metadata),
			Valid:  true,
		}
	}

	var templateID sql.NullInt32
	if n.TemplateID != nil {
		templateID = sql.NullInt32{
			Int32: int32(*n.TemplateID),
			Valid: true,
		}
	}

	row := r.db.DB.QueryRowContext(
		ctx,
		query,
		templateID,
		n.Recipient,
		n.Subject,
		n.Content,
		n.Status,
		n.Channel,
		metadata,
		n.CreatedAt,
	)

	var (
		sentAt          sql.NullTime
		nullableMetadata sql.NullString
	)

	err := row.Scan(
		&n.ID,
		&templateID,
		&n.Recipient,
		&n.Subject,
		&n.Content,
		&n.Status,
		&n.Channel,
		&nullableMetadata,
		&n.CreatedAt,
		&sentAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}

	if templateID.Valid {
		id := int(templateID.Int32)
		n.TemplateID = &id
	}

	if nullableMetadata.Valid {
		n.Metadata = json.RawMessage(nullableMetadata.String)
	}

	if sentAt.Valid {
		n.SentAt = &sentAt.Time
	}

	return n, nil
}

// GetByID retrieves a notification by ID
func (r *NotificationRepository) GetByID(ctx context.Context, id int) (*models.Notification, error) {
	query := `
		SELECT id, template_id, recipient, subject, content, status, channel, metadata, created_at, sent_at
		FROM notifications
		WHERE id = $1
	`

	row := r.db.DB.QueryRowContext(ctx, query, id)

	var (
		n               models.Notification
		templateID      sql.NullInt32
		metadata        sql.NullString
		sentAt          sql.NullTime
	)

	err := row.Scan(
		&n.ID,
		&templateID,
		&n.Recipient,
		&n.Subject,
		&n.Content,
		&n.Status,
		&n.Channel,
		&metadata,
		&n.CreatedAt,
		&sentAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("notification not found: %w", err)
		}
		return nil, fmt.Errorf("failed to get notification: %w", err)
	}

	if templateID.Valid {
		id := int(templateID.Int32)
		n.TemplateID = &id
	}

	if metadata.Valid {
		n.Metadata = json.RawMessage(metadata.String)
	}

	if sentAt.Valid {
		n.SentAt = &sentAt.Time
	}

	return &n, nil
}

// UpdateNotification updates a notification with all fields
func (r *NotificationRepository) UpdateNotification(notification *models.Notification) error {
	query := `
		UPDATE notifications
		SET template_id = $1, recipient = $2, subject = $3, content = $4, status = $5, channel = $6, metadata = $7, sent_at = $8
		WHERE id = $9
	`
	
	var templateID sql.NullInt32
	if notification.TemplateID != nil {
		templateID = sql.NullInt32{
			Int32: int32(*notification.TemplateID),
			Valid: true,
		}
	}
	
	var metadata sql.NullString
	if notification.Metadata != nil {
		metadata = sql.NullString{
			String: string(notification.Metadata),
			Valid:  true,
		}
	}
	
	var sentAt sql.NullTime
	if notification.SentAt != nil {
		sentAt = sql.NullTime{
			Time:  *notification.SentAt,
			Valid: true,
		}
	}
	
	_, err := r.db.DB.ExecContext(
		context.Background(),
		query,
		templateID,
		notification.Recipient,
		notification.Subject,
		notification.Content,
		notification.Status,
		notification.Channel,
		metadata,
		sentAt,
		notification.ID,
	)
	
	if err != nil {
		return fmt.Errorf("failed to update notification: %w", err)
	}
	
	return nil
}

// UpdateStatus updates the status of a notification
func (r *NotificationRepository) UpdateStatus(ctx context.Context, id int, status models.NotificationStatus, sentAt *time.Time) error {
	query := `
		UPDATE notifications
		SET status = $1, sent_at = $2
		WHERE id = $3
	`

	result, err := r.db.DB.ExecContext(ctx, query, status, sentAt, id)
	if err != nil {
		return fmt.Errorf("failed to update notification status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("notification not found")
	}

	return nil
}

// List retrieves notifications with optional filtering
func (r *NotificationRepository) List(ctx context.Context, limit, offset int) ([]*models.Notification, error) {
	query := `
		SELECT id, template_id, recipient, subject, content, status, channel, metadata, created_at, sent_at
		FROM notifications
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.DB.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list notifications: %w", err)
	}
	defer rows.Close()

	notifications := make([]*models.Notification, 0)
	for rows.Next() {
		var (
			n           models.Notification
			templateID  sql.NullInt32
			metadata    sql.NullString
			sentAt      sql.NullTime
		)

		err := rows.Scan(
			&n.ID,
			&templateID,
			&n.Recipient,
			&n.Subject,
			&n.Content,
			&n.Status,
			&n.Channel,
			&metadata,
			&n.CreatedAt,
			&sentAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}

		if templateID.Valid {
			id := int(templateID.Int32)
			n.TemplateID = &id
		}

		if metadata.Valid {
			n.Metadata = json.RawMessage(metadata.String)
		}

		if sentAt.Valid {
			n.SentAt = &sentAt.Time
		}

		notifications = append(notifications, &n)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating notifications: %w", err)
	}

	return notifications, nil
}

// Count counts the total number of notifications
func (r *NotificationRepository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM notifications`

	var count int
	err := r.db.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count notifications: %w", err)
	}

	return count, nil
}
