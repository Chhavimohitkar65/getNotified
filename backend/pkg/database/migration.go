package database

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"go.uber.org/zap"
)

// MigrationConfig contains configuration for database migrations
type MigrationConfig struct {
	MigrationsPath string
	DBConfig       *PostgresConfig
	Logger         *zap.Logger
}

// RunMigrations applies all pending migrations to the database using psql directly
func RunMigrations(config MigrationConfig) error {
	// Convert path to absolute if necessary
	migrationsPath, err := filepath.Abs(config.MigrationsPath)
	if err != nil {
		return fmt.Errorf("failed to get absolute path: %w", err)
	}

	// Log the start of migration process
	config.Logger.Info("Applying database migrations...",
		zap.String("path", migrationsPath),
	)

	// Get a list of migration files in order
	migrationFiles, err := getMigrationFiles(migrationsPath)
	if err != nil {
		return fmt.Errorf("failed to read migration files: %w", err)
	}

	// For each migration file, apply it using psql
	connStr := buildConnectionString(config.DBConfig)
	for _, file := range migrationFiles {
		if !strings.HasSuffix(file, ".up.sql") {
			continue
		}
		
		filePath := filepath.Join(migrationsPath, file)
		config.Logger.Info("Applying migration", zap.String("file", file))
		
		// Execute the SQL file using psql
		cmd := exec.Command("psql", connStr, "-f", filePath)
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to apply migration %s: %w", file, err)
		}
	}

	config.Logger.Info("Database migrations applied successfully")
	return nil

}

// CreateMigration creates a new migration file
func CreateMigration(migrationsPath, name string) error {
	log.Printf("Creating migration: %s\n", name)
	
	// Get the next version number
	files, err := os.ReadDir(migrationsPath)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}
	
	version := 1
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".up.sql") {
			parts := strings.Split(file.Name(), "_")
			if len(parts) > 0 {
				fileVersion := strings.TrimPrefix(parts[0], "0")
				if v, err := strconv.Atoi(fileVersion); err == nil && v >= version {
					version = v + 1
				}
			}
		}
	}
	
	// Create up migration
	upFile := filepath.Join(migrationsPath, fmt.Sprintf("%06d_%s.up.sql", version, name))
	if err := os.WriteFile(upFile, []byte("-- Migration Up\n\n"), 0644); err != nil {
		return fmt.Errorf("failed to create up migration file: %w", err)
	}
	
	// Create down migration
	downFile := filepath.Join(migrationsPath, fmt.Sprintf("%06d_%s.down.sql", version, name))
	if err := os.WriteFile(downFile, []byte("-- Migration Down\n\n"), 0644); err != nil {
		return fmt.Errorf("failed to create down migration file: %w", err)
	}
	
	log.Printf("Created migration files: %s, %s\n", upFile, downFile)
	return nil
}

// Helper function to get migration files sorted by version
func getMigrationFiles(migrationsPath string) ([]string, error) {
	files, err := os.ReadDir(migrationsPath)
	if err != nil {
		return nil, err
	}
	
	var fileNames []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".sql") {
			fileNames = append(fileNames, file.Name())
		}
	}
	
	// Sort files by version number
	sort.Slice(fileNames, func(i, j int) bool {
		partsI := strings.Split(fileNames[i], "_")
		partsJ := strings.Split(fileNames[j], "_")
		if len(partsI) > 0 && len(partsJ) > 0 {
			return partsI[0] < partsJ[0]
		}
		return fileNames[i] < fileNames[j]
	})
	
	return fileNames, nil
}

// buildConnectionString creates a connection string for psql
func buildConnectionString(config *PostgresConfig) string {
	return fmt.Sprintf(
		"postgresql://%s:%s@%s:%s/%s?sslmode=%s",
		config.User, config.Password, config.Host, config.Port, config.DBName, config.SSLMode,
	)
}
