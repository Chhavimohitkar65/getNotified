package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"go.uber.org/zap"
)

// ConsumerConfig holds the configuration for Kafka consumer
type ConsumerConfig struct {
	BootstrapServers string
	GroupID          string
	Topics           []string
	AutoOffsetReset  string // "earliest" or "latest"
	PollTimeout      time.Duration
	Logger           *zap.Logger
}

// DefaultConsumerConfig returns a default consumer configuration
func DefaultConsumerConfig() ConsumerConfig {
	return ConsumerConfig{
		BootstrapServers: "localhost:9092",
		GroupID:          "notification-consumer-group",
		AutoOffsetReset:  "earliest",
		PollTimeout:      100 * time.Millisecond,
	}
}

// Consumer handles consuming messages from Kafka topics
type Consumer struct {
	consumer *kafka.Consumer
	config   ConsumerConfig
	logger   *zap.Logger
	handlers map[string]MessageHandler
}

// MessageHandler is a function that processes a Kafka message
type MessageHandler func([]byte) error

// NewConsumer creates a new Kafka consumer
func NewConsumer(config ConsumerConfig) (*Consumer, error) {
	if config.Logger == nil {
		return nil, fmt.Errorf("logger is required")
	}

	kafkaConfig := &kafka.ConfigMap{
		"bootstrap.servers":  config.BootstrapServers,
		"group.id":           config.GroupID,
		"auto.offset.reset":  config.AutoOffsetReset,
		"enable.auto.commit": true,
	}

	consumer, err := kafka.NewConsumer(kafkaConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka consumer: %w", err)
	}

	return &Consumer{
		consumer: consumer,
		config:   config,
		logger:   config.Logger,
		handlers: make(map[string]MessageHandler),
	}, nil
}

// RegisterHandler registers a message handler for a topic
func (c *Consumer) RegisterHandler(topic string, handler MessageHandler) {
	c.handlers[topic] = handler
}

// Subscribe subscribes to the configured topics
func (c *Consumer) Subscribe() error {
	if len(c.config.Topics) == 0 {
		return fmt.Errorf("no topics specified for subscription")
	}

	c.logger.Info("Subscribing to topics", 
		zap.Strings("topics", c.config.Topics),
		zap.String("group_id", c.config.GroupID),
	)

	err := c.consumer.SubscribeTopics(c.config.Topics, nil)
	if err != nil {
		return fmt.Errorf("failed to subscribe to topics: %w", err)
	}

	return nil
}

// Start begins consuming messages in a loop until context is cancelled
func (c *Consumer) Start(ctx context.Context) error {
	if err := c.Subscribe(); err != nil {
		return err
	}

	c.logger.Info("Starting Kafka consumer",
		zap.Strings("topics", c.config.Topics),
		zap.String("group_id", c.config.GroupID),
	)

	for {
		select {
		case <-ctx.Done():
			c.logger.Info("Stopping Kafka consumer", zap.Error(ctx.Err()))
			return c.Close()
		default:
			ev := c.consumer.Poll(int(c.config.PollTimeout.Milliseconds()))
			if ev == nil {
				continue
			}

			switch e := ev.(type) {
			case *kafka.Message:
				c.handleMessage(e)
			case kafka.Error:
				c.logger.Error("Kafka consumer error", 
					zap.String("code", e.Code().String()),
					zap.Error(e),
				)
				// Handle Kafka-specific errors
				if e.Code() == kafka.ErrAllBrokersDown {
					return fmt.Errorf("all Kafka brokers are down: %w", e)
				}
			default:
				// Ignore other event types
			}
		}
	}
}

// handleMessage processes a Kafka message
func (c *Consumer) handleMessage(msg *kafka.Message) {
	topic := *msg.TopicPartition.Topic
	c.logger.Debug("Received message",
		zap.String("topic", topic),
		zap.Int32("partition", msg.TopicPartition.Partition),
		zap.Int64("offset", int64(msg.TopicPartition.Offset)),
		zap.Int("value_len", len(msg.Value)),
	)

	handler, ok := c.handlers[topic]
	if !ok {
		c.logger.Warn("No handler registered for topic", zap.String("topic", topic))
		return
	}

	if err := handler(msg.Value); err != nil {
		c.logger.Error("Failed to process message",
			zap.String("topic", topic),
			zap.Error(err),
		)
	}
}

// Close closes the consumer connection
func (c *Consumer) Close() error {
	if c.consumer == nil {
		return nil
	}
	return c.consumer.Close()
}

// Helper function to process messages into a struct
func UnmarshalMessage(data []byte, v interface{}) error {
	if err := json.Unmarshal(data, v); err != nil {
		return fmt.Errorf("failed to unmarshal message: %w", err)
	}
	return nil
}
