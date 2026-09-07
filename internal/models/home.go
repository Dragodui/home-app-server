package models

import "time"

type Home struct {
	ID         int       `gorm:"autoIncrement; primaryKey" json:"id"`
	Name       string    `gorm:"size:64;not null" json:"name"`
	InviteCode string    `gorm:"size:64;not null;unique" json:"invite_code"`
	Currency   string    `gorm:"size:3;not null;default:USD" json:"currency"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`

	// relations
	Memberships []HomeMembership `gorm:"foreignKey:HomeID" json:"memberships,omitempty"`
	Tasks       []Task           `gorm:"foreignKey:HomeID" json:"tasks,omitempty"`
	Rooms       []Room           `gorm:"foreignKey:HomeID" json:"rooms,omitempty"`
}

type CreateHomeRequest struct {
	Name string `json:"name" validate:"required,min=3"`
}

// UpdateHomeRequest carries the fields of a home that can be patched in one call.
// Both fields are optional so a caller can update just the name, just the
// currency, or both in a single request; at least one must be set.
type UpdateHomeRequest struct {
	Name     *string `json:"name,omitempty" validate:"omitempty,min=3,max=64"`
	Currency *string `json:"currency,omitempty" validate:"omitempty,oneof=USD EUR GBP PLN UAH BYN"`
}
