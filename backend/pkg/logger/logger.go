package logger

import (
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger wraps the zap logger
type Logger struct {
	log *zap.SugaredLogger
}

// NewLogger creates a new logger
func NewLogger() *Logger {
	config := zap.NewProductionEncoderConfig()
	config.TimeKey = "timestamp"
	config.EncodeTime = zapcore.TimeEncoderOfLayout(time.RFC3339)
	
	encoder := zapcore.NewJSONEncoder(config)
	
	core := zapcore.NewCore(
		encoder,
		zapcore.AddSync(os.Stdout),
		zapcore.InfoLevel,
	)
	
	logger := zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	sugar := logger.Sugar()
	
	return &Logger{log: sugar}
}

// Info logs an info message
func (l *Logger) Info(format string, args ...interface{}) {
	l.log.Infof(format, args...)
}

// Error logs an error message
func (l *Logger) Error(format string, args ...interface{}) {
	l.log.Errorf(format, args...)
}

// Warn logs a warning message
func (l *Logger) Warn(format string, args ...interface{}) {
	l.log.Warnf(format, args...)
}

// Debug logs a debug message
func (l *Logger) Debug(format string, args ...interface{}) {
	l.log.Debugf(format, args...)
}

// Fatal logs a fatal message and exits
func (l *Logger) Fatal(format string, args ...interface{}) {
	l.log.Fatalf(format, args...)
}

// WithField adds a field to the logger
func (l *Logger) WithField(key string, value interface{}) *Logger {
	return &Logger{log: l.log.With(key, value)}
}

// WithFields adds multiple fields to the logger
func (l *Logger) WithFields(fields map[string]interface{}) *Logger {
	args := make([]interface{}, 0, len(fields)*2)
	for k, v := range fields {
		args = append(args, k, v)
	}
	return &Logger{log: l.log.With(args...)}
}

// Sync flushes any buffered log entries
func (l *Logger) Sync() error {
	return l.log.Sync()
}

// HTTPMiddlewareLogger logs HTTP requests
func (l *Logger) HTTPMiddlewareLogger(method, path string, status int, latency time.Duration) {
	l.log.Infow("HTTP Request",
		"method", method,
		"path", path,
		"status", status,
		"latency", fmt.Sprintf("%v", latency),
	)
}
