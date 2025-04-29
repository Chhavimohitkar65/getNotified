package database

// PostgresConfig contains PostgreSQL connection parameters
type PostgresConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}
