package config

import (
	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Kafka    KafkaConfig
	Email    EmailConfig
	Auth     AuthConfig
}

// ServerConfig holds the HTTP server configuration
type ServerConfig struct {
	Port        string
	Environment string
}

// DatabaseConfig holds the database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// KafkaConfig holds the Kafka configuration
type KafkaConfig struct {
	Brokers []string
	Topic   string
}

// EmailConfig holds the email service configuration
type EmailConfig struct {
	APIKey       string
	FromEmail    string
	Domain       string
	DetailedLogs bool
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	APIKey            string
	SkipInDevelopment bool
}

// LoadConfig loads the configuration from environment variables and config files
func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	
	// Set defaults
	viper.SetDefault("server.port", "8000")
	viper.SetDefault("server.environment", "development")
	
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", "5432")
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "123")
	viper.SetDefault("database.dbname", "notification_system")
	viper.SetDefault("database.sslmode", "disable")
	
	viper.SetDefault("kafka.brokers", []string{"localhost:9092"})
	viper.SetDefault("kafka.topic", "notifications")
	
	viper.SetDefault("email.apikey", "")
	viper.SetDefault("email.fromemail", "noreply@example.com")
	viper.SetDefault("email.domain", "example.com")
	viper.SetDefault("email.detailedlogs", true)
	
	viper.SetDefault("auth.apikey", "your-secret-api-key")
	viper.SetDefault("auth.skipindevelopment", true)
	
	// Environment variables
	viper.AutomaticEnv()
	viper.SetEnvPrefix("APP")
	
	// Map environment variables
	viper.BindEnv("server.port", "SERVER_PORT")
	viper.BindEnv("server.environment", "ENVIRONMENT")
	
	viper.BindEnv("database.host", "DB_HOST")
	viper.BindEnv("database.port", "DB_PORT")
	viper.BindEnv("database.user", "DB_USER")
	viper.BindEnv("database.password", "DB_PASS")
	viper.BindEnv("database.dbname", "DB_NAME")
	
	viper.BindEnv("kafka.brokers", "KAFKA_BROKERS")
	viper.BindEnv("kafka.topic", "KAFKA_TOPIC")
	
	viper.BindEnv("email.apikey", "RESEND_API_KEY")
	viper.BindEnv("email.fromemail", "EMAIL_FROM")
	viper.BindEnv("email.domain", "RESEND_DOMAIN")
	viper.BindEnv("email.detailedlogs", "RESEND_DETAILED_LOGS")
	
	viper.BindEnv("auth.apikey", "AUTH_API_KEY")
	viper.BindEnv("auth.skipindevelopment", "AUTH_SKIP_IN_DEVELOPMENT")
	
	// Read configuration file (if exists)
	if err := viper.ReadInConfig(); err != nil {
		// It's okay if config file doesn't exist
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}
	
	config := &Config{
		Server: ServerConfig{
			Port:        viper.GetString("server.port"),
			Environment: viper.GetString("server.environment"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("database.host"),
			Port:     viper.GetString("database.port"),
			User:     viper.GetString("database.user"),
			Password: viper.GetString("database.password"),
			DBName:   viper.GetString("database.dbname"),
			SSLMode:  viper.GetString("database.sslmode"),
		},
		Kafka: KafkaConfig{
			Brokers: viper.GetStringSlice("kafka.brokers"),
			Topic:   viper.GetString("kafka.topic"),
		},
		Email: EmailConfig{
			APIKey:       viper.GetString("email.apikey"),
			FromEmail:    viper.GetString("email.fromemail"),
			Domain:       viper.GetString("email.domain"),
			DetailedLogs: viper.GetBool("email.detailedlogs"),
		},
		Auth: AuthConfig{
			APIKey:            viper.GetString("auth.apikey"),
			SkipInDevelopment: viper.GetBool("auth.skipindevelopment"),
		},
	}
	
	return config, nil
}
