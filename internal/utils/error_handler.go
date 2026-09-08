package utils

import (
	"fmt"
	"net/http"

	"github.com/Dragodui/diploma-server/internal/logger"
)

// SafeError logs the detailed error internally and returns a generic error to the client
func SafeError(w http.ResponseWriter, err error, userMessage string, statusCode int) {
	logError(w, err, userMessage, statusCode)
	JSONError(w, userMessage, statusCode)
}

// SafeErrorf is like SafeError but with formatted user message
func SafeErrorf(w http.ResponseWriter, err error, userMessageFormat string, statusCode int, args ...interface{}) {
	msg := fmt.Sprintf(userMessageFormat, args...)
	logError(w, err, msg, statusCode)
	JSONError(w, msg, statusCode)
}

// logError writes a structured error log line carrying the request id (read
// back off the response header set by middleware.RequestID) so it can be
// correlated with the matching access-log line in OpenSearch.
func logError(w http.ResponseWriter, err error, userMessage string, statusCode int) {
	logger.Error.WithFields(map[string]any{
		"request_id": w.Header().Get(RequestIDHeader),
		"status":     statusCode,
		"error":      err.Error(),
	}, "%s", userMessage)
}
