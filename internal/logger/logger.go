// Package logger provides leveled, structured (JSON) logging to stdout/stderr
// only. Every log line is a single JSON object with a fixed set of fields
// (time, level, msg, service, caller) so it can be picked up straight from
// the container's log stream (Docker's fluentd log driver -> Fluent Bit ->
// OpenSearch, see docker-compose.dev.yaml) with no file and no log-parsing
// regex on the ingestion side.
package logger

import (
	"encoding/json"
	"fmt"
	"io"
	"maps"
	"os"
	"runtime"
	"time"
)

const serviceName = "home-app-api"

// level is a structured logger bound to one severity; call sites keep using
// the familiar *log.Logger-style Printf/Print API so no call site needs to
// change, but the output is a JSON object instead of free-form text.
type level struct {
	name string
	out  io.Writer
}

func (l *level) write(msg string, fields map[string]any) {
	entry := map[string]any{
		"time":    time.Now().UTC().Format(time.RFC3339Nano),
		"level":   l.name,
		"service": serviceName,
		"msg":     msg,
	}
	maps.Copy(entry, fields)
	if _, file, line, ok := runtime.Caller(2); ok {
		entry["caller"] = fmt.Sprintf("%s:%d", trimToShort(file), line)
	}

	b, err := json.Marshal(entry)
	if err != nil {
		// Fall back to a plain line rather than losing the log entirely.
		fmt.Fprintf(l.out, `{"level":"ERROR","service":%q,"msg":"failed to marshal log entry: %v"}`+"\n", serviceName, err)
		return
	}
	l.out.Write(append(b, '\n'))
}

func trimToShort(file string) string {
	for i := len(file) - 1; i > 0; i-- {
		if file[i] == '/' {
			return file[i+1:]
		}
	}
	return file
}

func (l *level) Printf(format string, args ...any) { l.write(fmt.Sprintf(format, args...), nil) }
func (l *level) Print(args ...any)                 { l.write(fmt.Sprint(args...), nil) }

// WithFields logs msg (formatted like Printf) plus extra structured key-value
// fields merged into the JSON line - e.g. request_id, status, duration_ms.
func (l *level) WithFields(fields map[string]any, format string, args ...any) {
	l.write(fmt.Sprintf(format, args...), fields)
}

var (
	Info  *level
	Warn  *level
	Error *level
)

func init() {
	// Self-initialize so Info/Warn/Error are never nil - callers that don't
	// (or can't, e.g. a test package with no TestMain) call Init explicitly
	// still get working, if unconfigured, loggers instead of a nil-pointer panic.
	Init()
}

// Init (re)sets up the leveled loggers. Safe to call again (e.g. from
// main to make the setup explicit); a package-level init() already runs
// this once so it's never required.
func Init() {
	Info = &level{name: "INFO", out: os.Stdout}
	Warn = &level{name: "WARN", out: os.Stdout}
	Error = &level{name: "ERROR", out: os.Stderr}
}
