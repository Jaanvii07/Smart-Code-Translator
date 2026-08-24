import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  redact: {
    // Defense in depth: even if something slips through with these key
    // names, scrub it before it leaves the process.
    paths: [
      "req.headers.authorization",
      "*.password",
      "*.token",
      "*.credential",
      "*.prompt",
      "*.code",
    ],
    censor: "[REDACTED]",
  },
  base: undefined, // omit pid/hostname noise; add back if you run multiple instances and need to disambiguate
});

export default logger;