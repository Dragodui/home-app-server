package utils

// RequestIDHeader is the header carrying the per-request correlation id set
// by middleware.RequestID. Lives in utils (rather than the middleware
// package) so error_handler.go can read it back off the ResponseWriter
// without an import cycle (middleware already imports utils).
const RequestIDHeader = "X-Request-ID"
