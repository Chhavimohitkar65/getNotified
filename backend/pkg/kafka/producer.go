package kafka

import (
	"encoding/json"
	"fmt"

	"getnotified/internal/config"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// Producer wraps a Kafka producer
type Producer struct {
	producer *kafka.Producer
	topic    string
}

// NewProducer creates a new Kafka producer
func NewProducer(cfg config.KafkaConfig) (*Producer, error) {
	// Configure the producer
	config := &kafka.ConfigMap{
		"bootstrap.servers": cfg.Brokers[0],
		"client.id":         "notification-service",
		"acks":              "all",
	}

	// Create a new producer
	producer, err := kafka.NewProducer(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka producer: %w", err)
	}

	return &Producer{
		producer: producer,
		topic:    cfg.Topic,
	}, nil
}

// SendMessage sends a message to the Kafka topic
func (p *Producer) SendMessage(key string, message interface{}) error {
	// Convert message to JSON
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message to JSON: %w", err)
	}

	// Create a message and send it
	deliveryChan := make(chan kafka.Event)
	defer close(deliveryChan)

	err = p.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{
			Topic:     &p.topic,
			Partition: kafka.PartitionAny,
		},
		Key:   []byte(key),
		Value: jsonMessage,
	}, deliveryChan)

	if err != nil {
		return fmt.Errorf("failed to produce message: %w", err)
	}

	// Wait for delivery report
	e := <-deliveryChan
	m := e.(*kafka.Message)

	if m.TopicPartition.Error != nil {
		return fmt.Errorf("failed to deliver message: %w", m.TopicPartition.Error)
	}

	return nil
}

// Close closes the Kafka producer
func (p *Producer) Close() {
	p.producer.Close()
}
