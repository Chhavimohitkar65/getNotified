package user

import (
	"context"
	"errors"
	"time"

	"getnotified/internal/models"
	"getnotified/pkg/auth"
	"getnotified/pkg/logger"
)

// Repository defines the user repository interface
type Repository interface {
	Create(ctx context.Context, user *models.User) error
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByID(ctx context.Context, id int) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	UpdatePassword(ctx context.Context, userID int, passwordHash string) error
	Delete(ctx context.Context, id int) error
}

// Service handles user-related operations
type Service struct {
	repo      Repository
	authSvc   *auth.Service
	logger    *logger.Logger
}

// NewService creates a new user service
func NewService(repo Repository, authSvc *auth.Service, logger *logger.Logger) *Service {
	return &Service{
		repo:      repo,
		authSvc:   authSvc,
		logger:    logger,
	}
}

// Register creates a new user
func (s *Service) Register(ctx context.Context, req *models.UserRequest) (*models.User, error) {
	// Check if user with this email already exists
	existingUser, err := s.repo.GetByEmail(ctx, req.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash the password
	hashedPassword, err := models.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Name:         req.Name,
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	// Don't return the password hash
	user.PasswordHash = ""

	return user, nil
}

// Login authenticates a user and returns a JWT token
func (s *Service) Login(ctx context.Context, req *models.LoginRequest) (*models.LoginResponse, error) {
	// Get user by email
	user, err := s.repo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if !models.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// Generate token
	token, err := s.authSvc.GenerateToken(user.ID, user.Email)
	if err != nil {
		return nil, err
	}

	// Don't return the password hash
	user.PasswordHash = ""

	return &models.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

// GetUser retrieves a user by ID
func (s *Service) GetUser(ctx context.Context, id int) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Don't return the password hash
	user.PasswordHash = ""

	return user, nil
}

// UpdateUser updates a user's profile
func (s *Service) UpdateUser(ctx context.Context, id int, name string) (*models.User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	// Don't return the password hash
	user.PasswordHash = ""

	return user, nil
}

// UpdatePassword updates a user's password
func (s *Service) UpdatePassword(ctx context.Context, id int, currentPassword, newPassword string) error {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Check current password
	if !models.CheckPasswordHash(currentPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}

	// Hash the new password
	hashedPassword, err := models.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(ctx, id, hashedPassword)
}
