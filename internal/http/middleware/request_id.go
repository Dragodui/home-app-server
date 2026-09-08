package middleware

import (
	"context"
	"net/http"

	"github.com/Dragodui/diploma-server/internal/utils"
	"github.com/google/uuid"
)

type requestIDKeyType struct{}

var requestIDKey = requestIDKeyType{}

// RequestID stamps every request with an id (reused from the incoming
// X-Request-ID header if present), stores it on the context so handlers and
// the structured logger can attach it to log lines, and echoes it back on
// the response so a client can correlate its own logs with server logs.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := r.Header.Get(utils.RequestIDHeader)
		if id == "" {
			id = uuid.NewString()
		}

		w.Header().Set(utils.RequestIDHeader, id)
		ctx := context.WithValue(r.Context(), requestIDKey, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetRequestID returns the request id stamped by RequestID, or "" if the
// middleware wasn't run (e.g. in a unit test that calls a handler directly).
func GetRequestID(r *http.Request) string {
	id, _ := r.Context().Value(requestIDKey).(string)
	return id
}
