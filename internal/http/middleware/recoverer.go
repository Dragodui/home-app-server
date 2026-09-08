package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/Dragodui/diploma-server/internal/logger"
	"github.com/Dragodui/diploma-server/internal/utils"
)

// Recoverer catches panics from downstream handlers, logs them (with the
// request id and a stack trace) as a structured error line instead of
// letting net/http silently abort the connection, and returns a normal
// JSON 500 response so clients don't see a hung connection.
func Recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if rec := recover(); rec != nil {
				logger.Error.WithFields(map[string]any{
					"request_id": GetRequestID(r),
					"method":     r.Method,
					"path":       r.URL.Path,
					"panic":      rec,
					"stack":      string(debug.Stack()),
				}, "panic recovered")

				utils.JSONError(w, "Internal server error", http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	})
}
