package channel

import (
	"context"
	"encoding/json"
	"errors"

	"getnotified/internal/models"
	"getnotified/pkg/logger"
)

// Repository defines the channel repository interface
type Repository interface {
	Create(ctx context.Context, channel *models.Channel) error
	GetByID(ctx context.Context, id int, userID int) (*models.Channel, error)
	ListByUserID(ctx context.Context, userID int) ([]*models.Channel, error)
	GetDefaultByType(ctx context.Context, userID int, channelType string) (*models.Channel, error)
	Update(ctx context.Context, channel *models.Channel) error
	Delete(ctx context.Context, id int, userID int) error
}

// Service handles channel-related operations
type Service struct {
	repo   Repository
	logger *logger.Logger
}

// NewService creates a new channel service
func NewService(repo Repository, logger *logger.Logger) *Service {
	return &Service{
		repo:   repo,
		logger: logger,
	}
}

// Create adds a new channel
func (s *Service) Create(ctx context.Context, userID int, req *models.ChannelRequest) (*models.Channel, error) {
	configJSON, err := json.Marshal(req.Config)
	if err != nil {
		return nil, err
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	channel := &models.Channel{
		UserID:   userID,
		Name:     req.Name,
		Type:     req.Type,
		Config:   configJSON,
		IsActive: isActive,
	}

	if err := s.repo.Create(ctx, channel); err != nil {
		return nil, err
	}

	return channel, nil
}

// Get retrieves a channel by ID
func (s *Service) Get(ctx context.Context, id int, userID int) (*models.ChannelResponse, error) {
	channel, err := s.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	return s.channelToResponse(channel)
}

// List retrieves all channels for a user
func (s *Service) List(ctx context.Context, userID int) ([]*models.ChannelResponse, error) {
	channels, err := s.repo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	response := make([]*models.ChannelResponse, 0, len(channels))
	for _, channel := range channels {
		channelResponse, err := s.channelToResponse(channel)
		if err != nil {
			return nil, err
		}
		response = append(response, channelResponse)
	}

	return response, nil
}

// GetDefaultByType retrieves the default channel for a user by type
func (s *Service) GetDefaultByType(ctx context.Context, userID int, channelType string) (*models.ChannelResponse, error) {
	channel, err := s.repo.GetDefaultByType(ctx, userID, channelType)
	if err != nil {
		return nil, err
	}

	return s.channelToResponse(channel)
}

// Update updates a channel
func (s *Service) Update(ctx context.Context, id int, userID int, req *models.ChannelRequest) (*models.ChannelResponse, error) {
	channel, err := s.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	configJSON, err := json.Marshal(req.Config)
	if err != nil {
		return nil, err
	}

	channel.Name = req.Name
	channel.Type = req.Type
	channel.Config = configJSON
	if req.IsActive != nil {
		channel.IsActive = *req.IsActive
	}

	if err := s.repo.Update(ctx, channel); err != nil {
		return nil, err
	}

	return s.channelToResponse(channel)
}

// Delete removes a channel
func (s *Service) Delete(ctx context.Context, id int, userID int) error {
	return s.repo.Delete(ctx, id, userID)
}

// Helper method to convert channel model to response
func (s *Service) channelToResponse(channel *models.Channel) (*models.ChannelResponse, error) {
	if channel == nil {
		return nil, errors.New("channel is nil")
	}

	var config map[string]interface{}
	if err := json.Unmarshal(channel.Config, &config); err != nil {
		return nil, err
	}

	return &models.ChannelResponse{
		ID:        channel.ID,
		Name:      channel.Name,
		Type:      channel.Type,
		Config:    config,
		IsActive:  channel.IsActive,
		CreatedAt: channel.CreatedAt,
		UpdatedAt: channel.UpdatedAt,
	}, nil
}
