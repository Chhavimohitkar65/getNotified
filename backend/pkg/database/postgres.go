package database

import (
	"database/sql"
	"fmt"
	
	"getnotified/internal/config"
	_ "github.com/lib/pq"
)

// PostgresDB wraps a SQL database connection
type PostgresDB struct {
	DB *sql.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg config.DatabaseConfig) (*PostgresDB, error) {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode)
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}
	
	// Check the connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	
	return &PostgresDB{DB: db}, nil
}

// Close closes the database connection
func (db *PostgresDB) Close() error {
	return db.DB.Close()
}

// RunMigrations runs database migrations
func (db *PostgresDB) RunMigrations() error {
	// Create notifications table if it doesn't exist
	_, err := db.DB.Exec(`
		CREATE TABLE IF NOT EXISTS templates (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			subject VARCHAR(255) NOT NULL,
			channel VARCHAR(50) NOT NULL,
			content TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create templates table: %w", err)
	}

	// Create notifications table if it doesn't exist
	_, err = db.DB.Exec(`
		CREATE TABLE IF NOT EXISTS notifications (
			id SERIAL PRIMARY KEY,
			template_id INTEGER REFERENCES templates(id),
			recipient VARCHAR(255) NOT NULL,
			subject VARCHAR(255) NOT NULL,
			content TEXT NOT NULL,
			status VARCHAR(50) NOT NULL,
			channel VARCHAR(50) NOT NULL,
			metadata JSONB,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
			sent_at TIMESTAMP WITH TIME ZONE
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create notifications table: %w", err)
	}

	return nil
}
